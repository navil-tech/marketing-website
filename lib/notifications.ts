import { hasLabel, type SourceLabel } from "@/lib/source-label";
import { getPrisma } from "@/lib/db";
import type { LeadKind, Region } from "@/lib/generated/prisma/client";
import ru from "@/messages/ru.json";

const DEFAULT_TELEGRAM_API_URL = "https://api.telegram.org";

const TELEGRAM_TIMEOUT_MS = 10_000;

const KIND_TITLES: Record<LeadKind, string> = {
  SHIPPER: "заказчик",
  CARRIER: "перевозчик",
};

const LABEL_TITLES: [keyof SourceLabel, string][] = [
  ["utmSource", "source"],
  ["utmMedium", "medium"],
  ["utmCampaign", "campaign"],
  ["utmContent", "content"],
  ["utmTerm", "term"],
];

export interface MessageLead {
  id: string;
  kind: LeadKind;
  region: Region;
  createdAt: Date;
}

export interface MessageSession extends SourceLabel {
  id: string;
  startedAt: Date;
}

interface TelegramConfig {
  apiUrl: string;
  token: string;
  chatId: string;
  threadId: number | null;
}

interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: { message_id: number };
}

export function buildLeadMessage(lead: MessageLead, session: MessageSession | null): string {
  return [
    `Новая заявка: ${KIND_TITLES[lead.kind]}`,
    `Район: ${ru.fields.regions[lead.region]}`,
    `Источник: ${describeSource(session)}`,
    `Время до заявки: ${session === null ? "—" : formatInterval(lead.createdAt.getTime() - session.startedAt.getTime())}`,
    `Заявка: ${lead.id}`,
    `Сессия: ${session === null ? "не определена" : session.id}`,
  ].join("\n");
}

export async function deliverNotification(notificationId: string): Promise<void> {
  const config = telegramConfig();
  if (config === null) {
    return;
  }
  try {
    const prisma = getPrisma();
    const notification = await prisma.notification.findUniqueOrThrow({ where: { id: notificationId } });
    const outcome = await sendTelegramMessage(config, notification.text);
    if (outcome.messageId === null) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "FAILED", error: outcome.error },
      });
    } else {
      await prisma.$executeRaw`
        UPDATE "Notification"
        SET "status" = 'SENT'::"NotificationStatus", "sentAt" = clock_timestamp(), "telegramMessageId" = ${outcome.messageId}
        WHERE "id" = ${notificationId}
      `;
    }
  } catch (error) {
    console.error("notification delivery is not recorded", error);
  }
}

function describeSource(session: MessageSession | null): string {
  if (session === null) {
    return "неизвестен";
  }
  if (!hasLabel(session)) {
    return "без метки";
  }
  return LABEL_TITLES.filter(([key]) => session[key] !== null)
    .map(([key, title]) => `${title}=${session[key]}`)
    .join(", ");
}

function formatInterval(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  if (minutes > 0) {
    return `${minutes} мин ${seconds} с`;
  }
  return `${seconds} с`;
}

function telegramConfig(): TelegramConfig | null {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_CHAT_ID"];
  if (token === undefined || token === "" || chatId === undefined || chatId === "") {
    return null;
  }
  const apiUrl = process.env["TELEGRAM_API_URL"];
  const threadId = Number(process.env["TELEGRAM_THREAD_ID"]);
  return {
    apiUrl: apiUrl === undefined || apiUrl === "" ? DEFAULT_TELEGRAM_API_URL : apiUrl,
    token,
    chatId,
    threadId: Number.isInteger(threadId) && threadId > 0 ? threadId : null,
  };
}

async function sendTelegramMessage(
  config: TelegramConfig,
  text: string,
): Promise<{ messageId: number | null; error: string | null }> {
  try {
    const response = await fetch(`${config.apiUrl}/bot${config.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        ...(config.threadId === null ? {} : { message_thread_id: config.threadId }),
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    const body = (await response.json()) as TelegramResponse;
    if (!body.ok || body.result === undefined) {
      return { messageId: null, error: body.description ?? `HTTP ${response.status}` };
    }
    return { messageId: body.result.message_id, error: null };
  } catch (error) {
    return { messageId: null, error: error instanceof Error ? error.message : String(error) };
  }
}
