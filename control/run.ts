import "dotenv/config";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPrisma } from "@/lib/db";
import { sessionTimeoutSeconds } from "@/lib/sessions";
import { closeBrowsers, launchBrowsers, sleep } from "./browser";
import { startGateway, type Gateway } from "./gateway";
import { CONTROL_MAILBOX } from "./hypothesis";
import type { JournalEntry, RunMeta } from "./journal";
import { buildBoundarySet, buildMatrix, type BoundaryScenario, type Scenario } from "./matrix";
import { currentPlan, describePlan } from "./plan";
import { runBoundary, runScenario } from "./scenarios";
import {
  accessLog,
  concurrency,
  engines,
  externalGateway,
  gatewayPort,
  only,
  outDir,
  pauseMs,
  runId,
  sinkPort,
  upstream,
} from "./settings";
import { startSink } from "./sink";

const DELIVERY_SETTLE_MS = 1000;

const DELIVERY_WAIT_LIMIT_MS = 15_000;

async function main(): Promise<void> {
  const plan = currentPlan();
  console.log(describePlan(plan));
  const scenarios = buildMatrix().filter((scenario: Scenario) => only === undefined || only.includes(scenario.id));
  const boundary = buildBoundarySet().filter(
    (scenario: BoundaryScenario) => only === undefined || only.includes(scenario.id),
  );
  // a broken engine must stop the run before any result file exists
  await launchBrowsers(
    [...scenarios, ...boundary].map((scenario: Scenario | BoundaryScenario) => scenario.profile.engine),
  );
  mkdirSync(outDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const gateway: Gateway =
    externalGateway === undefined
      ? await startGateway(upstream, gatewayPort, accessLog)
      : { url: externalGateway, close: () => Promise.resolve() };
  const sink = await startSink(sinkPort, join(outDir, "telegram.log"));
  const jobs: (() => Promise<JournalEntry>)[] = [
    ...scenarios.map((scenario: Scenario) => () => runScenario(gateway.url, scenario)),
    ...boundary.map((scenario: BoundaryScenario) => () => runBoundary(gateway.url, scenario)),
  ];
  let substituted = 0;
  await runPool(jobs, concurrency, pauseMs, (entry: JournalEntry) => {
    appendFileSync(join(outDir, "journal.jsonl"), `${JSON.stringify(entry)}\n`);
    substituted += entry.plannedEngine === entry.actualEngine ? 0 : 1;
    console.log(`${entry.scenario} ${entry.class} ${entry.profile} ${entry.error === null ? "done" : entry.error}`);
  });
  await closeBrowsers();
  await waitForDeliveries(sink.received);
  await sink.close();
  await gateway.close();
  await getPrisma().$disconnect();
  const meta: RunMeta = {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    target: externalGateway ?? upstream.toString(),
    accessLog,
    engines,
    substituted,
    timeoutSeconds: sessionTimeoutSeconds(),
    plan,
  };
  writeFileSync(join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`journal: ${join(outDir, "journal.jsonl")}`);
}

async function runPool(
  jobs: (() => Promise<JournalEntry>)[],
  size: number,
  pause: number,
  onDone: (entry: JournalEntry) => void,
): Promise<void> {
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < jobs.length) {
      const job = jobs[next];
      next += 1;
      onDone(await job());
      await sleep(pause);
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
}

async function waitForDeliveries(received: () => number): Promise<void> {
  await sleep(DELIVERY_SETTLE_MS);
  if (received() === 0) {
    return;
  }
  const deadline = Date.now() + DELIVERY_WAIT_LIMIT_MS;
  while (Date.now() < deadline) {
    const pending = await getPrisma().notification.count({
      where: { status: "CREATED", lead: { email: { endsWith: `-${runId}@${CONTROL_MAILBOX}` } } },
    });
    if (pending === 0) {
      return;
    }
    await sleep(DELIVERY_SETTLE_MS);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
