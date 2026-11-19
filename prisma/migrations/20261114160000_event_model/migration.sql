-- CreateEnum
CREATE TYPE "ClientKind" AS ENUM ('BROWSER', 'BOT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SESSION_STARTED', 'FORM_SUBMITTED', 'LEAD_SAVED', 'NOTIFICATION_CREATED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('CREATED', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "fbclid",
DROP COLUMN "firstReferrer",
DROP COLUMN "firstVisitAt",
DROP COLUMN "gclid",
DROP COLUMN "landingPath",
DROP COLUMN "utmCampaign",
DROP COLUMN "utmContent",
DROP COLUMN "utmMedium",
DROP COLUMN "utmSource",
DROP COLUMN "utmTerm",
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT clock_timestamp();

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
    "lastSeenAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
    "client" "ClientKind" NOT NULL,
    "landingPath" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ip" VARCHAR(45),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGSERIAL NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
    "type" "EventType" NOT NULL,
    "sessionId" TEXT,
    "leadId" TEXT,
    "requestId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT clock_timestamp(),
    "leadId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'CREATED',
    "sentAt" TIMESTAMPTZ(3),
    "telegramMessageId" INTEGER,
    "error" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "Event_sessionId_id_idx" ON "Event"("sessionId", "id");

-- CreateIndex
CREATE INDEX "Event_leadId_id_idx" ON "Event"("leadId", "id");

-- CreateIndex
CREATE INDEX "Event_type_occurredAt_idx" ON "Event"("type", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_leadId_key" ON "Notification"("leadId");

-- CreateIndex
CREATE INDEX "Lead_sessionId_idx" ON "Lead"("sessionId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
