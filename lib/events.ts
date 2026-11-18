import type { EventType, Prisma } from "@/lib/generated/prisma/client";

export interface EventInput {
  type: EventType;
  sessionId: string | null;
  leadId: string | null;
  requestId: string | null;
  occurredAt: Date | null;
}

export async function recordEvent(db: Prisma.TransactionClient, event: EventInput): Promise<void> {
  await db.event.create({
    data: {
      type: event.type,
      sessionId: event.sessionId,
      leadId: event.leadId,
      requestId: event.requestId,
      ...(event.occurredAt === null ? {} : { occurredAt: event.occurredAt }),
    },
  });
}
