-- CreateEnum
CREATE TYPE "LeadKind" AS ENUM ('SHIPPER', 'CARRIER');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('TEL_AVIV', 'RAMAT_GAN_GIVATAYIM', 'BAT_YAM_HOLON', 'PETAH_TIKVA', 'RISHON_LEZION', 'HERZLIYA_RAANANA', 'BNEI_BRAK', 'WHOLE_COUNTRY', 'OTHER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" "LeadKind" NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "region" "Region" NOT NULL,
    "vehicle" TEXT,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "ip" VARCHAR(45),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "landingPath" TEXT,
    "firstReferrer" TEXT,
    "firstVisitAt" TIMESTAMPTZ(3),
    "consentGiven" BOOLEAN NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "isSpam" BOOLEAN NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_kind_createdAt_idx" ON "Lead"("kind", "createdAt");
