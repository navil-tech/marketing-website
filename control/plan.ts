import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { ALPHA, THRESHOLD, TOLERANCE_MS } from "./hypothesis";
import { buildBoundarySet, buildMatrix } from "./matrix";

export interface Plan {
  sha256: string;
  commit: string | null;
  dirty: boolean | null;
}

export function planSha256(): string {
  const plan = {
    threshold: THRESHOLD,
    toleranceMs: TOLERANCE_MS,
    alpha: ALPHA,
    scenarios: buildMatrix(),
    boundary: buildBoundarySet(),
  };
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}

export function currentPlan(): Plan {
  const status = git(["status", "--porcelain"]);
  return {
    sha256: planSha256(),
    commit: git(["rev-parse", "HEAD"]),
    dirty: status === null ? null : status !== "",
  };
}

export function describePlan(plan: Plan): string {
  const commit = plan.commit ?? "unknown";
  const state = plan.dirty === true ? " with uncommitted changes" : "";
  return `plan sha256 ${plan.sha256}, commit ${commit}${state}`;
}

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}
