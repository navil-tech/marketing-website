import "dotenv/config";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPrisma } from "@/lib/db";
import type { Session } from "@/lib/generated/prisma/client";
import { TOLERANCE_MS } from "./hypothesis";
import type { JournalEntry } from "./journal";
import {
  databaseRecords,
  judge,
  LEAD_LINE,
  SESSION_LINE,
  SOURCE_LINE,
  type LeadRecord,
  type Records,
  type Verdict,
} from "./judge";

type Criterion = "linked" | "labelKept" | "intervalWithin";

interface Sample {
  entry: JournalEntry;
  lead: LeadRecord;
  session: Session;
}

interface Case {
  entry: JournalEntry;
  lead: LeadRecord | null;
  sessions: Map<string, Session>;
}

interface Distortion {
  id: string;
  title: string;
  criterion: Criterion;
  apply(target: Case, other: Sample): void;
}

interface Outcome {
  id: string;
  title: string;
  criterion: Criterion;
  applied: number;
  detected: number;
  missed: string[];
}

const SHIFT_MS = TOLERANCE_MS * 3;

const UNKNOWN_SESSION = "00000000-0000-7000-8000-000000000000";

const TAMPERED = "tampered";

const DISTORTIONS: Distortion[] = [
  {
    id: "notification-missing",
    title: "уведомление удалено",
    criterion: "linked",
    apply: (target: Case) => {
      requireLead(target).notification = null;
    },
  },
  {
    id: "notification-other-lead",
    title: "в уведомлении номер чужой заявки",
    criterion: "linked",
    apply: (target: Case, other: Sample) => {
      rewriteLine(target, LEAD_LINE, `Заявка: ${other.lead.id}`);
    },
  },
  {
    id: "notification-other-session",
    title: "в уведомлении номер чужой сессии",
    criterion: "linked",
    apply: (target: Case, other: Sample) => {
      rewriteLine(target, SESSION_LINE, `Сессия: ${other.session.id}`);
    },
  },
  {
    id: "notification-unknown-session",
    title: "в уведомлении номер несуществующей сессии",
    criterion: "linked",
    apply: (target: Case) => {
      rewriteLine(target, SESSION_LINE, `Сессия: ${UNKNOWN_SESSION}`);
    },
  },
  {
    id: "lead-other-session",
    title: "заявка привязана к чужой сессии",
    criterion: "linked",
    apply: (target: Case, other: Sample) => {
      requireLead(target).sessionId = other.session.id;
    },
  },
  {
    id: "session-bot",
    title: "сессия помечена как бот",
    criterion: "linked",
    apply: (target: Case) => {
      for (const session of target.sessions.values()) {
        session.client = "BOT";
      }
    },
  },
  {
    id: "event-missing",
    title: "событие LEAD_SAVED удалено",
    criterion: "linked",
    apply: (target: Case) => {
      const lead = requireLead(target);
      lead.events = lead.events.filter((event) => event.type !== "LEAD_SAVED");
    },
  },
  {
    id: "event-order",
    title: "события заявки переставлены местами",
    criterion: "linked",
    apply: (target: Case) => {
      const lead = requireLead(target);
      const saved = lead.events.find((event) => event.type === "LEAD_SAVED");
      const created = lead.events.find((event) => event.type === "NOTIFICATION_CREATED");
      if (saved !== undefined && created !== undefined) {
        [saved.id, created.id] = [created.id, saved.id];
      }
    },
  },
  {
    id: "journal-entry",
    title: "в журнале стенда указан другой вход",
    criterion: "linked",
    apply: (target: Case) => {
      if (target.entry.expected !== null) {
        target.entry.expected.entryNav = target.entry.expected.entryNav === 1 ? 2 : 1;
      }
    },
  },
  {
    id: "session-label",
    title: "метка сессии изменена",
    criterion: "labelKept",
    apply: (target: Case) => {
      const session = requireLead(target).session;
      if (session !== null) {
        session.utmSource = TAMPERED;
      }
    },
  },
  {
    id: "notification-source",
    title: "строка «Источник» в уведомлении изменена",
    criterion: "labelKept",
    apply: (target: Case) => {
      rewriteLine(target, SOURCE_LINE, `Источник: source=${TAMPERED}`);
    },
  },
  {
    id: "journal-label",
    title: "в журнале стенда указана другая метка",
    criterion: "labelKept",
    apply: (target: Case) => {
      if (target.entry.expected !== null) {
        target.entry.expected.label.utmSource = TAMPERED;
      }
    },
  },
  {
    id: "saved-late",
    title: `время сохранения заявки сдвинуто на ${SHIFT_MS} мс`,
    criterion: "intervalWithin",
    apply: (target: Case) => {
      const saved = requireLead(target).events.find((event) => event.type === "LEAD_SAVED");
      if (saved !== undefined) {
        saved.occurredAt = new Date(saved.occurredAt.getTime() + SHIFT_MS);
      }
    },
  },
  {
    id: "started-early",
    title: `время начала сессии сдвинуто на ${SHIFT_MS} мс`,
    criterion: "intervalWithin",
    apply: (target: Case) => {
      const started = requireLead(target).session?.events.find((event) => event.type === "SESSION_STARTED");
      if (started !== undefined) {
        started.occurredAt = new Date(started.occurredAt.getTime() - SHIFT_MS);
      }
    },
  },
  {
    id: "journal-time",
    title: `время отправки в журнале стенда сдвинуто на ${SHIFT_MS} мс`,
    criterion: "intervalWithin",
    apply: (target: Case) => {
      const submit = target.entry.submits.at(-1);
      if (submit !== undefined) {
        submit.sentAt += SHIFT_MS;
      }
    },
  },
];

async function main(): Promise<void> {
  const runId = process.env["CONTROL_RUN_ID"] ?? latestRun();
  const dir = join("control", "out", runId);
  const journal = readLines<JournalEntry>(join(dir, "journal.jsonl")).filter((entry: JournalEntry) => !entry.boundary);
  const samples: Sample[] = [];
  for (const entry of journal) {
    const sample = await loadSample(runId, entry);
    if (sample !== null) {
      samples.push(sample);
    }
  }
  await getPrisma().$disconnect();
  if (samples.length < 2) {
    throw new Error("the self-check needs at least two scenarios that pass all three criteria");
  }

  const outcomes: Outcome[] = [];
  for (const distortion of DISTORTIONS) {
    const outcome: Outcome = {
      id: distortion.id,
      title: distortion.title,
      criterion: distortion.criterion,
      applied: 0,
      detected: 0,
      missed: [],
    };
    for (const [index, sample] of samples.entries()) {
      const other = samples[(index + 1) % samples.length];
      const target: Case = {
        entry: structuredClone(sample.entry),
        lead: structuredClone(sample.lead),
        sessions: new Map([
          [sample.session.id, structuredClone(sample.session)],
          [other.session.id, structuredClone(other.session)],
        ]),
      };
      distortion.apply(target, other);
      const verdict = await judge(runId, target.entry, new Map(), new Set(), recordsOf(target));
      outcome.applied += 1;
      if (verdict[distortion.criterion]) {
        outcome.missed.push(sample.entry.scenario);
      } else {
        outcome.detected += 1;
      }
    }
    outcomes.push(outcome);
  }

  const summary = {
    runId,
    scenarios: samples.length,
    skipped: journal.length - samples.length,
    distortions: outcomes.length,
    applied: sum(outcomes, (outcome: Outcome) => outcome.applied),
    detected: sum(outcomes, (outcome: Outcome) => outcome.detected),
    outcomes,
  };
  writeFileSync(join(dir, "selfcheck.json"), JSON.stringify(summary, null, 2));
  writeFileSync(join(dir, "selfcheck.md"), render(summary));
  console.log(
    `self-check ${runId}: ${summary.distortions} distortions on ${summary.scenarios} scenarios, detected ${summary.detected} of ${summary.applied}`,
  );
  console.log(`report: ${join(dir, "selfcheck.md")}`);
  if (summary.detected !== summary.applied) {
    process.exitCode = 1;
  }
}

async function loadSample(runId: string, entry: JournalEntry): Promise<Sample | null> {
  const submit = entry.submits.at(-1);
  if (submit === undefined) {
    return null;
  }
  const verdict: Verdict = await judge(runId, entry, new Map(), new Set());
  if (!verdict.linked || !verdict.labelKept || !verdict.intervalWithin) {
    return null;
  }
  const [lead] = await databaseRecords.leads(submit);
  const session = lead.sessionId === null ? null : await databaseRecords.session(lead.sessionId);
  return session === null ? null : { entry, lead, session };
}

function recordsOf(target: Case): Records {
  return {
    leads: () => Promise.resolve(target.lead === null ? [] : [target.lead]),
    session: (id: string) => Promise.resolve(target.sessions.get(id) ?? null),
  };
}

function requireLead(target: Case): LeadRecord {
  if (target.lead === null) {
    throw new Error("the case has no lead");
  }
  return target.lead;
}

function rewriteLine(target: Case, pattern: RegExp, line: string): void {
  const notification = requireLead(target).notification;
  if (notification !== null) {
    notification.text = notification.text.replace(pattern, line);
  }
}

function sum(outcomes: Outcome[], pick: (outcome: Outcome) => number): number {
  return outcomes.reduce((total: number, outcome: Outcome) => total + pick(outcome), 0);
}

function render(summary: {
  runId: string;
  scenarios: number;
  skipped: number;
  distortions: number;
  applied: number;
  detected: number;
  outcomes: Outcome[];
}): string {
  const criteria: Record<Criterion, string> = {
    linked: "связь уведомления с сессией",
    labelKept: "метка источника",
    intervalWithin: "интервал в пределах допуска",
  };
  return [
    `# Самопроверка стенда на прогоне ${summary.runId}`,
    "",
    "Каждое искажение вносится в копию записей одного сценария в памяти; база не меняется. Искажение обнаружено, если сверка перестаёт засчитывать сценарий по своему критерию.",
    "",
    `Сценариев, прошедших все три критерия: ${summary.scenarios}. Пропущено: ${summary.skipped}.`,
    `Видов искажений: ${summary.distortions}. Обнаружено ${summary.detected} из ${summary.applied}.`,
    "",
    "| Искажение | Критерий | Применено | Обнаружено | Не обнаружено в |",
    "| --- | --- | --- | --- | --- |",
    ...summary.outcomes.map(
      (outcome: Outcome) =>
        `| ${outcome.title} | ${criteria[outcome.criterion]} | ${outcome.applied} | ${outcome.detected} | ${outcome.missed.join(", ") || "нет"} |`,
    ),
    "",
  ].join("\n");
}

function latestRun(): string {
  const latest = readdirSync(join("control", "out")).sort().at(-1);
  if (latest === undefined) {
    throw new Error("no control runs found");
  }
  return latest;
}

function readLines<T>(path: string): T[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((line: string) => line !== "")
    .map((line: string) => JSON.parse(line) as T);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
