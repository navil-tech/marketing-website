import { getPrisma } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import type { FirstTouch } from "@/lib/first-touch";
import type { LeadKind, Prisma, Region } from "@/lib/generated/prisma/client";
import { buildLeadMessage } from "@/lib/notifications";
import { touchSession } from "@/lib/sessions";

export interface FormRequest {
  kind: LeadKind;
  sessionId: string | null;
  firstTouch: FirstTouch | null;
  pageUrl: string | null;
  userAgent: string | null;
  ip: string | null;
  requestId: string | null;
}

export interface LeadInput {
  locale: string;
  name: string;
  email: string;
  phone: string | null;
  region: Region;
  vehicle: string | null;
  consentVersion: string;
  isSpam: boolean;
}

export async function receiveForm(request: FormRequest): Promise<FormRequest> {
  try {
    const prisma = getPrisma();
    const session =
      request.sessionId === null
        ? null
        : await prisma.session.findUnique({ where: { id: request.sessionId }, select: { id: true } });
    const sessionId = session === null ? null : session.id;
    await recordEvent(prisma, {
      type: "FORM_SUBMITTED",
      sessionId,
      leadId: null,
      requestId: request.requestId,
      occurredAt: null,
    });
    return { ...request, sessionId };
  } catch (error) {
    console.error("form submission is not recorded", error);
    return { ...request, sessionId: null };
  }
}

export async function saveLead(request: FormRequest, input: LeadInput): Promise<string | null> {
  try {
    return await saveLeadWithEvents(request, input);
  } catch (error) {
    console.error("lead is saved without session and events", error);
    await getPrisma().lead.create({ data: leadData({ ...request, sessionId: null }, input) });
    return null;
  }
}

async function saveLeadWithEvents(request: FormRequest, input: LeadInput): Promise<string | null> {
  return getPrisma().$transaction(async (tx: Prisma.TransactionClient) => {
    const lead = await tx.lead.create({ data: leadData(request, input), include: { session: true } });
    const event = { sessionId: lead.sessionId, leadId: lead.id, requestId: request.requestId };
    await recordEvent(tx, { type: "LEAD_SAVED", occurredAt: lead.createdAt, ...event });
    if (lead.sessionId !== null) {
      await touchSession(tx, lead.sessionId);
    }
    if (lead.isSpam) {
      return null;
    }
    const notification = await tx.notification.create({
      data: { leadId: lead.id, text: buildLeadMessage(lead, lead.session) },
    });
    await recordEvent(tx, { type: "NOTIFICATION_CREATED", occurredAt: notification.createdAt, ...event });
    return notification.id;
  });
}

function leadData(request: FormRequest, input: LeadInput): Prisma.LeadUncheckedCreateInput {
  return {
    ...input,
    kind: request.kind,
    sessionId: request.sessionId,
    ...(request.firstTouch === null ? {} : { firstTouch: request.firstTouch }),
    pageUrl: request.pageUrl,
    userAgent: request.userAgent,
    ip: request.ip,
    consentGiven: true,
  };
}
