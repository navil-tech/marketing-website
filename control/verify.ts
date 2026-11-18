import "dotenv/config";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPrisma } from "@/lib/db";
import { reconstructSessions } from "./baseline";
import type { AccessRecord } from "./gateway";
import type { JournalEntry, RunMeta } from "./journal";
import { judge, judgeBoundary, type BoundaryVerdict, type Verdict } from "./judge";
import { buildMatrix } from "./matrix";
import { buildReport, renderReport, renderSummary } from "./report";
import type { SinkRecord } from "./sink";

async function main(): Promise<void> {
  const runId = process.env["CONTROL_RUN_ID"] ?? latestRun();
  const dir = join("control", "out", runId);
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")) as RunMeta;
  const journal = readLines<JournalEntry>(join(dir, "journal.jsonl"));
  const heuristic = reconstructSessions(readLines<AccessRecord>(meta.accessLog), meta.timeoutSeconds);
  const sinkPath = join(dir, "telegram.log");
  const delivered = new Set(
    (existsSync(sinkPath) ? readLines<SinkRecord>(sinkPath) : []).map((record: SinkRecord) => record.text),
  );

  const verdicts: Verdict[] = [];
  const boundary: BoundaryVerdict[] = [];
  for (const entry of journal) {
    if (entry.boundary) {
      boundary.push(await judgeBoundary(runId, entry));
    } else {
      verdicts.push(await judge(runId, entry, heuristic, delivered));
    }
  }
  verdicts.sort((a: Verdict, b: Verdict) => a.scenario.localeCompare(b.scenario));
  boundary.sort((a: BoundaryVerdict, b: BoundaryVerdict) => a.scenario.localeCompare(b.scenario));
  await getPrisma().$disconnect();

  const report = buildReport(meta, buildMatrix().length, verdicts, boundary);
  writeFileSync(join(dir, "report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(dir, "report.md"), renderReport(report));
  console.log(renderSummary(report));
  console.log(`report: ${join(dir, "report.md")}`);
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
