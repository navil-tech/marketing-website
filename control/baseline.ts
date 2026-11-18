import { hasLabel, isSameLabel, readSourceLabel, type SourceLabel } from "@/lib/source-label";
import type { AccessRecord } from "./gateway";

export interface HeuristicSession {
  entry: AccessRecord;
  entryTime: number;
  label: SourceLabel;
  lastTime: number;
}

const PAGE_PATH = /^\/(?:(?:ru|en|he)(?:\/|$))?(?:carriers|about|thanks)?\/?$/;

export function reconstructSessions(records: AccessRecord[], timeoutSeconds: number): Map<string, HeuristicSession[]> {
  const sessions = new Map<string, HeuristicSession[]>();
  const pages = records.filter(isPageRecord).sort((a: AccessRecord, b: AccessRecord) => receivedAt(a) - receivedAt(b));
  for (const record of pages) {
    const key = clientKey(record.ip, record.userAgent);
    const label = readSourceLabel(new URL(record.uri, "http://localhost").searchParams);
    const list = sessions.get(key) ?? [];
    const current = list.at(-1);
    const time = receivedAt(record);
    const expired = current === undefined || time - current.lastTime > timeoutSeconds * 1000;
    const relabelled = current !== undefined && hasLabel(label) && !isSameLabel(label, current.label);
    if (current === undefined || expired || relabelled) {
      list.push({ entry: record, entryTime: time, label, lastTime: time });
    } else {
      current.lastTime = time;
    }
    sessions.set(key, list);
  }
  return sessions;
}

export function findSession(
  sessions: Map<string, HeuristicSession[]>,
  ip: string | null,
  userAgent: string | null,
  time: number,
): HeuristicSession | null {
  const list = sessions.get(clientKey(ip ?? "", userAgent ?? "")) ?? [];
  const started = list.filter((session: HeuristicSession) => session.entryTime <= time);
  return started.at(-1) ?? null;
}

function isPageRecord(record: AccessRecord): boolean {
  if (record.method !== "GET" || record.status >= 400) {
    return false;
  }
  if (record.secFetchDest !== "" && record.secFetchDest !== "document") {
    return false;
  }
  return PAGE_PATH.test(new URL(record.uri, "http://localhost").pathname);
}

function receivedAt(record: AccessRecord): number {
  return (record.time - (record.requestTime ?? 0)) * 1000;
}

function clientKey(ip: string, userAgent: string): string {
  return `${ip}|${userAgent}`;
}
