import { ALPHA, THRESHOLD, TOLERANCE_MS } from "./hypothesis";
import type { RunMeta } from "./journal";
import { TIME_SHIFTED_CLASSES, type BoundaryVerdict, type Verdict } from "./judge";
import { summarizeErrors, testProportion, type ErrorSummary, type ProportionTest } from "./stats";

export interface Report {
  meta: RunMeta;
  conclusive: boolean;
  thresholds: { share: number; toleranceMs: number; alpha: number; plannedScenarios: number };
  system: {
    linked: ProportionTest;
    labelKept: ProportionTest;
    intervalWithin: ProportionTest;
    errors: ErrorSummary;
    delivered: number;
  };
  firstTouch: { labelKept: ProportionTest; intervalWithin: ProportionTest };
  baseline: { scenarios: number; linked: ProportionTest; labelKept: ProportionTest; intervalWithin: ProportionTest };
  verdicts: Verdict[];
  boundary: BoundaryVerdict[];
}

export function buildReport(
  meta: RunMeta,
  plannedScenarios: number,
  verdicts: Verdict[],
  boundary: BoundaryVerdict[],
): Report {
  const test = (pick: (verdict: Verdict) => boolean, list: Verdict[]): ProportionTest =>
    testProportion(list.filter(pick).length, list.length, THRESHOLD, ALPHA);
  const comparable = verdicts.filter((verdict: Verdict) => verdict.baselineApplicable);
  const errors = verdicts
    .map((verdict: Verdict) => verdict.errorMs)
    .filter((value: number | null): value is number => value !== null);
  return {
    meta,
    conclusive: meta.substituted === 0 && verdicts.length === plannedScenarios,
    thresholds: { share: THRESHOLD, toleranceMs: TOLERANCE_MS, alpha: ALPHA, plannedScenarios },
    system: {
      linked: test((v: Verdict) => v.linked, verdicts),
      labelKept: test((v: Verdict) => v.labelKept, verdicts),
      intervalWithin: test((v: Verdict) => v.intervalWithin, verdicts),
      errors: summarizeErrors(errors),
      delivered: verdicts.filter((v: Verdict) => v.delivered).length,
    },
    firstTouch: {
      labelKept: test((v: Verdict) => v.firstTouchLabelKept, verdicts),
      intervalWithin: test((v: Verdict) => v.firstTouchIntervalWithin, verdicts),
    },
    baseline: {
      scenarios: comparable.length,
      linked: test((v: Verdict) => v.baselineLinked, comparable),
      labelKept: test((v: Verdict) => v.baselineLabelKept, comparable),
      intervalWithin: test((v: Verdict) => v.baselineIntervalWithin, comparable),
    },
    verdicts,
    boundary,
  };
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

function renderTest(title: string, test: ProportionTest): string {
  return `| ${title} | ${test.successes} / ${test.total} | ${percent(test.share)} | ${percent(test.lowerBound)} | ${test.pValue.toFixed(4)} | ${test.confirmed ? "да" : "нет"} |`;
}

function renderClasses(title: string, verdicts: Verdict[]): string {
  const counts = new Map<string, { label: number; interval: number; total: number }>();
  for (const verdict of verdicts) {
    const count = counts.get(verdict.class) ?? { label: 0, interval: 0, total: 0 };
    count.total += 1;
    count.label += verdict.firstTouchLabelKept ? 0 : 1;
    count.interval += verdict.firstTouchIntervalWithin ? 0 : 1;
    counts.set(verdict.class, count);
  }
  const failed = [...counts.entries()].filter(([, count]) => count.label > 0 || count.interval > 0);
  if (failed.length === 0) {
    return `${title}: расхождений нет.`;
  }
  return [
    `${title}:`,
    "",
    "| Класс | Сценариев | Метка не совпала | Интервал вне допуска |",
    "|---|---|---|---|",
    ...failed.map(([name, count]) => `| ${name} | ${count.total} | ${count.label} | ${count.interval} |`),
  ].join("\n");
}

export function renderSummary(report: Report): string {
  const { system } = report;
  return [
    `run ${report.meta.runId}: ${report.verdicts.length} of ${report.thresholds.plannedScenarios} scenarios, ${report.meta.substituted} engine substitutions`,
    `linked ${system.linked.successes}/${system.linked.total}, label ${system.labelKept.successes}/${system.labelKept.total}, interval ${system.intervalWithin.successes}/${system.intervalWithin.total}`,
    `first touch: label ${report.firstTouch.labelKept.successes}/${report.firstTouch.labelKept.total}, interval ${report.firstTouch.intervalWithin.successes}/${report.firstTouch.intervalWithin.total}`,
    `conclusive: ${report.conclusive}`,
  ].join("\n");
}

export function renderReport(report: Report): string {
  const { meta, system, firstTouch, baseline } = report;
  const failed = report.verdicts.filter((v: Verdict) => !v.linked || !v.labelKept || !v.intervalWithin);
  const lines: string[] = [
    `# Контрольный прогон ${meta.runId}`,
    "",
    `Период: ${meta.startedAt} — ${meta.finishedAt}. Стенд: ${meta.target}. Движки: ${meta.engines.join(", ")}.`,
    `Сценариев выполнено: ${report.verdicts.length} из ${report.thresholds.plannedScenarios}. Подмен движка: ${meta.substituted}.`,
    "",
    report.conclusive
      ? "Прогон полный: по нему выносится вывод о гипотезе."
      : "Прогон технический: часть сценариев выполнена не на своём движке или не выполнена. Вывод о гипотезе по нему не выносится.",
    "",
    "## Критерии гипотезы",
    "",
    `Порог ${percent(report.thresholds.share)}, допуск интервала ${report.thresholds.toleranceMs} мс, точный биномиальный тест, α = ${report.thresholds.alpha}.`,
    "",
    "| Критерий | Успехов | Доля | Нижняя граница (95 %, Клоппер — Пирсон) | p | Порог подтверждён |",
    "|---|---|---|---|---|---|",
    renderTest("Уведомление связано с сессией", system.linked),
    renderTest("Метка источника сохранена", system.labelKept),
    renderTest("Интервал в пределах допуска", system.intervalWithin),
    "",
    `Погрешность интервала: медиана ${system.errors.median.toFixed(0)} мс, максимум по модулю ${system.errors.maxAbsolute.toFixed(0)} мс.`,
    "",
    system.delivered === 0
      ? "Доставка в приёмник Telegram в этом прогоне не проверялась: сайт запущен без адреса приёмника."
      : `Доставлено в контрольный приёмник Telegram с тем же текстом: ${system.delivered} из ${report.verdicts.length}.`,
    "",
    "## Сравнение: метка первого визита в заявке",
    "",
    "Обычная схема: при первом визите метка и время пишутся в cookie, при отправке формы — в заявку. Сессий в ней нет, поэтому связь уведомления с сессией не оценивается.",
    "",
    "| Критерий | Успехов | Доля | Нижняя граница (95 %, Клоппер — Пирсон) | p | Порог подтверждён |",
    "|---|---|---|---|---|---|",
    renderTest("Метка источника сохранена", firstTouch.labelKept),
    renderTest("Интервал в пределах допуска", firstTouch.intervalWithin),
    "",
    renderClasses("Сценарии, где обычная схема расходится с журналом стенда, по классам", report.verdicts),
    "",
    "## Сравнение: IP + User-Agent + тайм-аут по журналу запросов",
    "",
    `Сравнение на ${baseline.scenarios} сценариях; классы со сдвигом времени в базе (${TIME_SHIFTED_CLASSES.join(", ")}) исключены, потому что журнал запросов сдвиг не видит.`,
    "",
    "| Критерий | Успехов | Доля | Нижняя граница (95 %, Клоппер — Пирсон) | p | Порог подтверждён |",
    "|---|---|---|---|---|---|",
    renderTest("Заявка связана с входом", baseline.linked),
    renderTest("Метка источника сохранена", baseline.labelKept),
    renderTest("Интервал в пределах допуска", baseline.intervalWithin),
    "",
    "",
    "## Граничные сценарии",
    "",
    "Вне матрицы: показывают, как система учитывает случаи за границей применимости.",
    "",
    "| Сценарий | Класс | Ожидание | Совпало | Факт |",
    "|---|---|---|---|---|",
    ...report.boundary.map(
      (b: BoundaryVerdict) =>
        `| ${b.scenario} | ${b.class} | ${b.expectation} | ${b.handled ? "да" : "нет"} | ${b.notes.join("; ")} |`,
    ),
    "",
    "## Сценарии с отклонениями",
    "",
    failed.length === 0 ? "Отклонений нет." : "| Сценарий | Класс | Профиль | Замечания |",
    ...(failed.length === 0 ? [] : ["|---|---|---|---|"]),
    ...failed.map((v: Verdict) => `| ${v.scenario} | ${v.class} | ${v.profile} | ${v.notes.join("; ")} |`),
    "",
    "## Все сценарии",
    "",
    "| Сценарий | Класс | Профиль | Связь | Метка | Интервал | Погрешность, мс | Первый визит: метка | Первый визит: интервал | IP+UA: связь | IP+UA: метка | IP+UA: интервал |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...report.verdicts.map((v: Verdict) => {
      const mark = (value: boolean): string => (value ? "+" : "−");
      const base = (value: boolean): string => (v.baselineApplicable ? mark(value) : "н/п");
      return `| ${v.scenario} | ${v.class} | ${v.profile} | ${mark(v.linked)} | ${mark(v.labelKept)} | ${mark(v.intervalWithin)} | ${v.errorMs ?? "—"} | ${mark(v.firstTouchLabelKept)} | ${mark(v.firstTouchIntervalWithin)} | ${base(v.baselineLinked)} | ${base(v.baselineLabelKept)} | ${base(v.baselineIntervalWithin)} |`;
    }),
    "",
  ];
  return lines.join("\n");
}
