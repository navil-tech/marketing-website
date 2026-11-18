import { isbot } from "isbot";
import { getPrisma } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import type { ClientKind, Prisma } from "@/lib/generated/prisma/client";
import { hasLabel, isSameLabel, type SourceLabel } from "@/lib/source-label";

export const SESSION_COOKIE = "nv_sid";

const SESSION_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;

const DEFAULT_SESSION_TIMEOUT_SECONDS = 30 * 60;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SessionCookieOptions {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  secure: boolean;
}

export interface PageRequest {
  sessionId: string | null;
  path: string;
  label: SourceLabel;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
  requestId: string | null;
}

export interface SessionState extends SourceLabel {
  lastSeenAt: Date;
  now: Date;
}

export function sessionCookieOptions(secure: boolean): SessionCookieOptions {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_COOKIE_MAX_AGE_SECONDS, secure };
}

export function readSessionId(value: string | undefined): string | null {
  return value !== undefined && UUID_PATTERN.test(value) ? value : null;
}

export function classifyClient(userAgent: string | null): ClientKind {
  return userAgent === null || userAgent === "" || isbot(userAgent) ? "BOT" : "BROWSER";
}

export function clientIp(forwardedFor: string | null): string | null {
  if (forwardedFor === null) {
    return null;
  }
  const first = forwardedFor.split(",")[0].trim();
  return first === "" ? null : first;
}

export function sessionTimeoutSeconds(): number {
  const configured = Number(process.env["SESSION_TIMEOUT_SECONDS"]);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_TIMEOUT_SECONDS;
}

export function continuesSession(session: SessionState, requestLabel: SourceLabel, timeoutSeconds: number): boolean {
  const idleSeconds = (session.now.getTime() - session.lastSeenAt.getTime()) / 1000;
  if (idleSeconds >= timeoutSeconds) {
    return false;
  }
  return !hasLabel(requestLabel) || isSameLabel(requestLabel, session);
}

export async function resolveSession(request: PageRequest): Promise<string> {
  if (request.sessionId !== null) {
    const current = await findSessionState(request.sessionId);
    if (current !== null && continuesSession(current, request.label, sessionTimeoutSeconds())) {
      await touchSession(getPrisma(), request.sessionId);
      return request.sessionId;
    }
  }
  return startSession(request);
}

export async function touchSession(db: Prisma.TransactionClient, sessionId: string): Promise<void> {
  await db.$executeRaw`UPDATE "Session" SET "lastSeenAt" = clock_timestamp() WHERE "id" = ${sessionId}`;
}

async function findSessionState(sessionId: string): Promise<SessionState | null> {
  const rows = await getPrisma().$queryRaw<SessionState[]>`
    SELECT "lastSeenAt", clock_timestamp() AS "now", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent"
    FROM "Session"
    WHERE "id" = ${sessionId}
  `;
  return rows.length === 0 ? null : rows[0];
}

async function startSession(request: PageRequest): Promise<string> {
  return getPrisma().$transaction(async (tx: Prisma.TransactionClient) => {
    const session = await tx.session.create({
      data: {
        client: classifyClient(request.userAgent),
        landingPath: request.path,
        referrer: request.referrer,
        userAgent: request.userAgent,
        ip: request.ip,
        ...request.label,
      },
    });
    await recordEvent(tx, {
      type: "SESSION_STARTED",
      sessionId: session.id,
      leadId: null,
      requestId: request.requestId,
      occurredAt: session.startedAt,
    });
    return session.id;
  });
}
