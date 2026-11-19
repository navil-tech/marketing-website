import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPrisma } from "@/lib/db";
import { parseFirstTouch } from "@/lib/first-touch";
import { isSameLabel, readSourceLabel } from "@/lib/source-label";
import type { AccessRecord } from "./gateway";
import { ALPHA, CONTROL_MAILBOX, THRESHOLD, TOLERANCE_MS } from "./hypothesis";
import {
  eventChain,
  expectedSourceLine,
  LEAD_INCLUDE,
  LEAD_LINE,
  SESSION_LINE,
  SOURCE_LINE,
  type LeadRecord,
} from "./judge";
import { summarizeErrors, testProportion, type ProportionTest } from "./stats";

type FirstTouchOutcome = "same" | "different" | "missing" | "unknown";

interface FieldVerdict {
  lead: string;
  createdAt: string;
  linked: boolean;
  labelKept: boolean;
  intervalWithin: boolean;
  errorMs: number | null;
  firstTouch: FirstTouchOutcome;
  notes: string[];
}

interface FieldReport {
  from: string;
  to: string;
  accessLogs: string[];
  includesControlData: boolean;
  minimumSample: number;
  sufficient: boolean;
  linked: ProportionTest;
  labelKept: ProportionTest;
  intervalWithin: ProportionTest;
  errors: { median: number; maxAbsolute: number };
  firstTouch: Record<FirstTouchOutcome, number>;
  verdicts: FieldVerdict[];
}

const MINIMUM_SAMPLE = Math.ceil(Math.log(ALPHA) / Math.log(THRESHOLD));

async function main(): Promise<void> {
  const from = requiredDate("FIELD_FROM");
  const to = requiredDate("FIELD_TO");
  const accessLogs = requiredValue("FIELD_ACCESS_LOG").split(",");
  const includesControlData = process.env["FIELD_INCLUDE_CONTROL"] === "1";
  const log = readAccessLogs(accessLogs);

  const prisma = getPrisma();
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: { gte: from, lt: to },
      isSpam: false,
      ...(includesControlData ? {} : { NOT: { email: { endsWith: `@${CONTROL_MAILBOX}` } } }),
    },
    include: LEAD_INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  await prisma.$disconnect();

  const verdicts = leads.map((lead: LeadRecord) => judgeLead(lead, log));
  const test = (pick: (verdict: FieldVerdict) => boolean): ProportionTest =>
    testProportion(verdicts.filter(pick).length, verdicts.length, THRESHOLD, ALPHA);
  const errors = summarizeErrors(
    verdicts.map((v: FieldVerdict) => v.errorMs).filter((value: number | null): value is number => value !== null),
  );
  const count = (outcome: FirstTouchOutcome): number =>
    verdicts.filter((v: FieldVerdict) => v.firstTouch === outcome).length;
  const report: FieldReport = {
    from: from.toISOString(),
    to: to.toISOString(),
    accessLogs,
    includesControlData,
    minimumSample: MINIMUM_SAMPLE,
    sufficient: verdicts.length >= MINIMUM_SAMPLE,
    linked: test((v: FieldVerdict) => v.linked),
    labelKept: test((v: FieldVerdict) => v.labelKept),
    intervalWithin: test((v: FieldVerdict) => v.intervalWithin),
    errors: { median: errors.median, maxAbsolute: errors.maxAbsolute },
    firstTouch: {
      same: count("same"),
      different: count("different"),
      missing: count("missing"),
      unknown: count("unknown"),
    },
    verdicts,
  };

  const dir = join("control", "out", `field-${dayOf(from)}_${dayOf(to)}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(dir, "report.md"), renderReport(report));
  console.log(
    `${verdicts.length} leads, minimum sample ${MINIMUM_SAMPLE}: linked ${report.linked.successes}, label ${report.labelKept.successes}, interval ${report.intervalWithin.successes}`,
  );
  console.log(`report: ${join(dir, "report.md")}`);
}

function judgeLead(lead: LeadRecord, log: Map<string, AccessRecord>): FieldVerdict {
  const verdict: FieldVerdict = {
    lead: lead.id,
    createdAt: lead.createdAt.toISOString(),
    linked: false,
    labelKept: false,
    intervalWithin: false,
    errorMs: null,
    firstTouch: "unknown",
    notes: [],
  };
  const chain = eventChain(lead);
  if (lead.session === null || chain === null) {
    verdict.notes.push(lead.session === null ? "lead has no session" : "event chain is incomplete");
    return verdict;
  }
  const entry = findRecord(log, chain.started.requestId, "GET");
  const submit = findRecord(log, chain.submitted.requestId, "POST");

  const linkNotes: string[] = [];
  const text = lead.notification?.text ?? "";
  if (lead.notification === null) {
    linkNotes.push("link: notification is missing");
  }
  if (LEAD_LINE.exec(text)?.[1] !== lead.id || SESSION_LINE.exec(text)?.[1] !== lead.session.id) {
    linkNotes.push("link: notification names another lead or session");
  }
  if (lead.session.client !== "BROWSER") {
    linkNotes.push("link: session is classified as a bot");
  }
  if (!(
    chain.started.id < chain.submitted.id &&
    chain.submitted.id < chain.saved.id &&
    chain.saved.id < chain.created.id
  )) {
    linkNotes.push("link: event chain is out of order");
  }
  if (entry === null) {
    linkNotes.push("link: the access log has no page request that started the session");
  }
  if (submit === null) {
    linkNotes.push("link: the access log has no form submission of this lead");
  }
  verdict.linked = linkNotes.length === 0;
  verdict.notes.push(...linkNotes);

  if (entry !== null) {
    const logged = readSourceLabel(new URL(entry.uri, "http://localhost").searchParams);
    verdict.labelKept = isSameLabel(lead.session, logged) && SOURCE_LINE.exec(text)?.[1] === expectedSourceLine(logged);
    if (!verdict.labelKept) {
      verdict.notes.push("label: stored label or notification differs from the access log");
    }
    const firstTouch = parseFirstTouch(lead.firstTouch);
    verdict.firstTouch = firstTouch === null ? "missing" : isSameLabel(firstTouch, logged) ? "same" : "different";
  }

  if (entry !== null && submit !== null) {
    const reference = receivedAt(submit) - receivedAt(entry);
    verdict.errorMs = Math.round(chain.saved.occurredAt.getTime() - chain.started.occurredAt.getTime() - reference);
    verdict.intervalWithin = Math.abs(verdict.errorMs) <= TOLERANCE_MS;
    if (!verdict.intervalWithin) {
      verdict.notes.push(`interval: error ${verdict.errorMs} ms`);
    }
  }
  return verdict;
}

function findRecord(log: Map<string, AccessRecord>, requestId: string | null, method: string): AccessRecord | null {
  const record = requestId === null ? undefined : log.get(requestId);
  return record !== undefined && record.method === method ? record : null;
}

function receivedAt(record: AccessRecord): number {
  return (record.time - record.requestTime) * 1000;
}

function readAccessLogs(paths: string[]): Map<string, AccessRecord> {
  const log = new Map<string, AccessRecord>();
  for (const path of paths) {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (line === "") {
        continue;
      }
      const record = JSON.parse(line) as AccessRecord;
      log.set(record.requestId, record);
    }
  }
  return log;
}

function requiredValue(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`${name} is required`);
  }
  return value;
}

function requiredDate(name: string): Date {
  const date = new Date(requiredValue(name));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${name} is not a date`);
  }
  return date;
}

function dayOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

function renderTest(title: string, test: ProportionTest, sufficient: boolean): string {
  const decision = !sufficient ? "данных недостаточно" : test.confirmed ? "да" : "нет";
  return `| ${title} | ${test.successes} / ${test.total} | ${percent(test.share)} | ${percent(test.lowerBound)} | ${test.pValue.toFixed(4)} | ${decision} |`;
}

function renderReport(report: FieldReport): string {
  const total = report.verdicts.length;
  const failed = report.verdicts.filter((v: FieldVerdict) => !v.linked || !v.labelKept || !v.intervalWithin);
  return [
    `# Проверка на реальных заявках: ${report.from.slice(0, 10)} — ${report.to.slice(0, 10)}`,
    "",
    `Заявок в выборке: ${total}. Эталон: журнал веб-сервера (${report.accessLogs.join(", ")}).`,
    report.includesControlData
      ? "В выборку включены заявки контрольного стенда: это самопроверка команды, а не проверка гипотезы."
      : "Заявки контрольного стенда и спам исключены.",
    "",
    report.sufficient
      ? `Выборка достаточна: не менее ${report.minimumSample} заявок.`
      : `Данных недостаточно: для вывода при пороге ${percent(THRESHOLD)} и α = ${ALPHA} нужно не менее ${report.minimumSample} заявок. Вывод о гипотезе не выносится.`,
    "",
    "## Критерии гипотезы",
    "",
    "| Критерий | Успехов | Доля | Нижняя граница (95 %, Клоппер — Пирсон) | p | Порог подтверждён |",
    "|---|---|---|---|---|---|",
    renderTest("Уведомление связано с сессией", report.linked, report.sufficient),
    renderTest("Метка источника сохранена", report.labelKept, report.sufficient),
    renderTest("Интервал в пределах допуска", report.intervalWithin, report.sufficient),
    "",
    `Погрешность интервала по модулю: медиана ${report.errors.median.toFixed(0)} мс, максимум ${report.errors.maxAbsolute.toFixed(0)} мс.`,
    "",
    "## Сравнение: метка первого визита в заявке",
    "",
    `Совпала с журналом: ${report.firstTouch.same}. Назван другой источник: ${report.firstTouch.different}. Метки в заявке нет: ${report.firstTouch.missing}. Сравнить не с чем (нет записи в журнале): ${report.firstTouch.unknown}.`,
    "",
    "## Заявки с отклонениями",
    "",
    failed.length === 0 ? "Отклонений нет." : "| Заявка | Создана | Замечания |",
    ...(failed.length === 0 ? [] : ["|---|---|---|"]),
    ...failed.map((v: FieldVerdict) => `| ${v.lead} | ${v.createdAt} | ${v.notes.join("; ")} |`),
    "",
  ].join("\n");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
