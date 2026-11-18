import type { Engine, FormKind, Label } from "./matrix";

export interface NavRecord {
  nav: number;
  url: string;
  sentAt: number;
}

export interface SubmitRecord {
  email: string;
  kind: FormKind;
  sentAt: number;
  sessionCookie: string | null;
}

export interface JournalEntry {
  scenario: string;
  class: string;
  boundary: boolean;
  profile: string;
  plannedEngine: Engine;
  actualEngine: Engine;
  clientIp: string;
  expected: { entryNav: number; label: Label } | null;
  navs: NavRecord[];
  submits: SubmitRecord[];
  error: string | null;
}

export interface RunMeta {
  runId: string;
  startedAt: string;
  finishedAt: string;
  target: string;
  accessLog: string;
  engines: Engine[];
  substituted: number;
  timeoutSeconds: number;
}
