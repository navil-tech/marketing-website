import { getPrisma } from "@/lib/db";
import { parseFirstTouch } from "@/lib/first-touch";
import type { Prisma } from "@/lib/generated/prisma/client";
import { isSameLabel } from "@/lib/source-label";
import { findSession, type HeuristicSession } from "./baseline";
import { NAV_MARKER, SCENARIO_MARKER, TOLERANCE_MS } from "./hypothesis";
import type { JournalEntry, SubmitRecord } from "./journal";
import type { Label } from "./matrix";

type LeadRecord = Prisma.LeadGetPayload<{
  include: { session: { include: { events: true } }; notification: true; events: true };
}>;

type EventRecord = LeadRecord["events"][number];

interface Chain {
  started: EventRecord;
  submitted: EventRecord;
  saved: EventRecord;
  created: EventRecord;
}

export interface Verdict {
  scenario: string;
  class: string;
  profile: string;
  linked: boolean;
  labelKept: boolean;
  intervalWithin: boolean;
  errorMs: number | null;
  delivered: boolean;
  baselineApplicable: boolean;
  baselineLinked: boolean;
  baselineLabelKept: boolean;
  baselineIntervalWithin: boolean;
  baselineErrorMs: number | null;
  firstTouchLabelKept: boolean;
  firstTouchIntervalWithin: boolean;
  firstTouchErrorMs: number | null;
  notes: string[];
}

export interface BoundaryVerdict {
  scenario: string;
  class: string;
  expectation: string;
  handled: boolean;
  notes: string[];
}

export const TIME_SHIFTED_CLASSES = ["timeout", "late-submit"];

const LEAD_LINE = /^Заявка: (.+)$/m;

const SESSION_LINE = /^Сессия: (.+)$/m;

const SOURCE_LINE = /^Источник: (.+)$/m;

const BOUNDARY_EXPECTATIONS: Record<string, string> = {
  "cookies-cleared": "заявка без сессии, уведомление с пометкой «не определена»",
  "bot-visit": "сессия класса BOT, заявки нет",
  honeypot: "заявка помечена как спам, уведомления нет",
  "slow-submit": "связь и метка сохранены, погрешность интервала выше допуска",
};

export async function judge(
  runId: string,
  entry: JournalEntry,
  heuristic: Map<string, HeuristicSession[]>,
  delivered: Set<string>,
): Promise<Verdict> {
  const verdict: Verdict = {
    scenario: entry.scenario,
    class: entry.class,
    profile: entry.profile,
    linked: false,
    labelKept: false,
    intervalWithin: false,
    errorMs: null,
    delivered: false,
    baselineApplicable: !TIME_SHIFTED_CLASSES.includes(entry.class),
    baselineLinked: false,
    baselineLabelKept: false,
    baselineIntervalWithin: false,
    baselineErrorMs: null,
    firstTouchLabelKept: false,
    firstTouchIntervalWithin: false,
    firstTouchErrorMs: null,
    notes: [],
  };
  const submit = entry.submits.at(-1);
  const expected = entry.expected;
  if (entry.error !== null || submit === undefined || expected === null) {
    verdict.notes.push(`scenario failed to run: ${entry.error ?? "no submission"}`);
    return verdict;
  }
  const leads = await findLeads(submit);
  if (leads.length !== 1) {
    verdict.notes.push(`expected one lead, found ${leads.length}`);
    return verdict;
  }
  const lead = leads[0];
  const entryNav = entry.navs.find((nav) => nav.nav === expected.entryNav);
  const marker = `${runId}-${entry.scenario}`;
  const reference = entryNav === undefined ? null : submit.sentAt - entryNav.sentAt;

  const linkNotes = await checkLink(lead, submit, marker, expected.entryNav);
  verdict.linked = linkNotes.length === 0;
  verdict.notes.push(...linkNotes);
  verdict.delivered = lead.notification !== null && delivered.has(lead.notification.text);

  const labelNotes = checkLabel(lead, expected.label);
  verdict.labelKept = labelNotes.length === 0;
  verdict.notes.push(...labelNotes);

  const chain = eventChain(lead);
  if (chain !== null && reference !== null) {
    verdict.errorMs = chain.saved.occurredAt.getTime() - chain.started.occurredAt.getTime() - reference;
    verdict.intervalWithin = Math.abs(verdict.errorMs) <= TOLERANCE_MS;
  }
  if (!verdict.intervalWithin) {
    verdict.notes.push(`interval: error ${verdict.errorMs ?? "n/a"} ms`);
  }

  const firstTouch = parseFirstTouch(lead.firstTouch);
  if (firstTouch !== null) {
    verdict.firstTouchLabelKept = isSameLabel(firstTouch, expected.label);
    if (reference !== null) {
      verdict.firstTouchErrorMs = lead.createdAt.getTime() - Date.parse(firstTouch.visitedAt) - reference;
      verdict.firstTouchIntervalWithin = Math.abs(verdict.firstTouchErrorMs) <= TOLERANCE_MS;
    }
  }

  if (verdict.baselineApplicable) {
    const guess = findSession(heuristic, lead.ip, lead.userAgent, lead.createdAt.getTime());
    if (guess !== null) {
      const params = new URL(guess.entry.uri, "http://localhost").searchParams;
      verdict.baselineLinked =
        params.get(SCENARIO_MARKER) === marker && params.get(NAV_MARKER) === String(expected.entryNav);
      verdict.baselineLabelKept = isSameLabel(guess.label, expected.label);
      if (reference !== null) {
        verdict.baselineErrorMs = lead.createdAt.getTime() - guess.entryTime - reference;
        verdict.baselineIntervalWithin = Math.abs(verdict.baselineErrorMs) <= TOLERANCE_MS;
      }
    }
  }
  return verdict;
}

async function checkLink(lead: LeadRecord, submit: SubmitRecord, marker: string, entryNav: number): Promise<string[]> {
  if (lead.notification === null) {
    return ["link: notification is missing"];
  }
  const text = lead.notification.text;
  const notes: string[] = [];
  if (LEAD_LINE.exec(text)?.[1] !== lead.id) {
    notes.push("link: notification names another lead");
  }
  const sessionId = SESSION_LINE.exec(text)?.[1];
  const session = sessionId === undefined ? null : await getPrisma().session.findUnique({ where: { id: sessionId } });
  if (session === null) {
    notes.push(`link: notification names no known session (${sessionId ?? "no line"})`);
    return notes;
  }
  const params = new URL(session.landingPath, "http://localhost").searchParams;
  if (params.get(SCENARIO_MARKER) !== marker || params.get(NAV_MARKER) !== String(entryNav)) {
    notes.push(`link: notification points to ${session.landingPath}, expected nav ${entryNav}`);
  }
  if (session.client !== "BROWSER") {
    notes.push("link: session is classified as a bot");
  }
  if (session.id !== lead.sessionId || session.id !== submit.sessionCookie) {
    notes.push("link: notification, lead and browser cookie name different sessions");
  }
  const chain = eventChain(lead);
  if (chain === null) {
    notes.push("link: event chain is incomplete");
  } else if (!(
    chain.started.id < chain.submitted.id &&
    chain.submitted.id < chain.saved.id &&
    chain.saved.id < chain.created.id
  )) {
    notes.push("link: event chain is out of order");
  }
  return notes;
}

function checkLabel(lead: LeadRecord, expected: Label): string[] {
  const notes: string[] = [];
  if (lead.session === null) {
    notes.push("label: no session");
  } else if (!isSameLabel(lead.session, expected)) {
    notes.push(`label: stored ${describeLabel(lead.session)}, expected ${describeLabel(expected)}`);
  }
  const stated = lead.notification === null ? undefined : SOURCE_LINE.exec(lead.notification.text)?.[1];
  if (stated !== expectedSourceLine(expected)) {
    notes.push(`label: notification states "${stated ?? "nothing"}", expected "${expectedSourceLine(expected)}"`);
  }
  return notes;
}

function expectedSourceLine(label: Label): string {
  const parts: [string, string | null][] = [
    ["source", label.utmSource],
    ["medium", label.utmMedium],
    ["campaign", label.utmCampaign],
    ["content", label.utmContent],
    ["term", label.utmTerm],
  ];
  const present = parts.filter(([, value]) => value !== null);
  return present.length === 0 ? "без метки" : present.map(([name, value]) => `${name}=${value}`).join(", ");
}

export async function judgeBoundary(runId: string, entry: JournalEntry): Promise<BoundaryVerdict> {
  const verdict: BoundaryVerdict = {
    scenario: entry.scenario,
    class: entry.class,
    expectation: BOUNDARY_EXPECTATIONS[entry.class] ?? "",
    handled: false,
    notes: [],
  };
  const prisma = getPrisma();
  if (entry.class === "bot-visit") {
    const sessions = await prisma.session.findMany({
      where: { landingPath: { contains: `${SCENARIO_MARKER}=${runId}-${entry.scenario}&` } },
      include: { leads: true },
    });
    verdict.handled = sessions.length === 1 && sessions[0].client === "BOT" && sessions[0].leads.length === 0;
    verdict.notes.push(`sessions: ${sessions.length}, client: ${sessions[0]?.client ?? "n/a"}`);
    return verdict;
  }
  const submit = entry.submits.at(-1);
  if (entry.error !== null || submit === undefined) {
    verdict.notes.push(`scenario failed to run: ${entry.error ?? "no submission"}`);
    return verdict;
  }
  const leads = await findLeads(submit);
  if (leads.length !== 1) {
    verdict.notes.push(`expected one lead, found ${leads.length}`);
    return verdict;
  }
  const lead = leads[0];
  if (entry.class === "cookies-cleared") {
    verdict.handled =
      lead.sessionId === null && lead.notification !== null && lead.notification.text.includes("не определена");
    verdict.notes.push(`session: ${lead.sessionId ?? "none"}, notification: ${lead.notification?.status ?? "none"}`);
  }
  if (entry.class === "honeypot") {
    verdict.handled = lead.isSpam && lead.notification === null;
    verdict.notes.push(`spam: ${lead.isSpam}, notification: ${lead.notification?.status ?? "none"}`);
  }
  if (entry.class === "slow-submit") {
    const entryNav = entry.navs.find((nav) => nav.nav === 1);
    const chain = eventChain(lead);
    const linkNotes = await checkLink(lead, submit, `${runId}-${entry.scenario}`, 1);
    const errorMs =
      chain === null || entryNav === undefined
        ? null
        : chain.saved.occurredAt.getTime() - chain.started.occurredAt.getTime() - (submit.sentAt - entryNav.sentAt);
    verdict.handled = linkNotes.length === 0 && errorMs !== null && Math.abs(errorMs) > TOLERANCE_MS;
    verdict.notes.push(`link notes: ${linkNotes.length}, interval error: ${errorMs ?? "n/a"} ms`);
  }
  return verdict;
}

async function findLeads(submit: SubmitRecord): Promise<LeadRecord[]> {
  return getPrisma().lead.findMany({
    where: { email: submit.email },
    include: {
      session: { include: { events: { orderBy: { id: "asc" } } } },
      notification: true,
      events: { orderBy: { id: "asc" } },
    },
  });
}

function eventChain(lead: LeadRecord): Chain | null {
  if (lead.session === null) {
    return null;
  }
  const sessionEvents = lead.session.events;
  const started = sessionEvents.find((event: EventRecord) => event.type === "SESSION_STARTED");
  const saved = lead.events.find((event: EventRecord) => event.type === "LEAD_SAVED");
  const created = lead.events.find((event: EventRecord) => event.type === "NOTIFICATION_CREATED");
  if (started === undefined || saved === undefined || created === undefined || saved.sessionId !== lead.session.id) {
    return null;
  }
  const submitted = sessionEvents
    .filter((event: EventRecord) => event.type === "FORM_SUBMITTED" && event.id < saved.id)
    .at(-1);
  return submitted === undefined ? null : { started, submitted, saved, created };
}

function describeLabel(label: Label): string {
  const parts = [label.utmSource, label.utmMedium, label.utmCampaign, label.utmTerm, label.utmContent];
  return parts.every((part: string | null) => part === null) ? "none" : parts.map((part) => part ?? "-").join("/");
}
