"use server";

import { cookies, headers } from "next/headers";
import { HONEYPOT_FIELD } from "@/components/forms/Honeypot";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution";
import { getPrisma } from "@/lib/db";
import type { LeadKind } from "@/lib/generated/prisma/client";
import { LEAD_CONSENT_VERSION, parseCarrierApplication, parseShipperLead, type CarrierApplication } from "@/lib/leads";
import { routes } from "@/lib/routes";

type LeadFields = Omit<CarrierApplication, "consent" | "vehicle"> & { vehicle: string | null };

export async function submitShipperLead(locale: Locale, formData: FormData): Promise<void> {
  const lead = parseShipperLead(formData);
  await persistLead("SHIPPER", locale, { ...lead, vehicle: null }, formData);
  redirect({ href: routes.thanks, locale });
}

export async function submitCarrierApplication(locale: Locale, formData: FormData): Promise<void> {
  const application = parseCarrierApplication(formData);
  await persistLead("CARRIER", locale, application, formData);
  redirect({ href: routes.thanks, locale });
}

async function persistLead(kind: LeadKind, locale: Locale, fields: LeadFields, formData: FormData): Promise<void> {
  const headerStore = await headers();
  const attributionCookie = (await cookies()).get(ATTRIBUTION_COOKIE);
  await getPrisma().lead.create({
    data: {
      kind,
      locale,
      name: fields.name,
      email: fields.email,
      phone: fields.phone,
      region: fields.region,
      vehicle: fields.vehicle,
      pageUrl: headerStore.get("referer"),
      userAgent: headerStore.get("user-agent"),
      ip: clientIp(headerStore.get("x-forwarded-for")),
      ...(attributionCookie === undefined ? {} : parseAttribution(attributionCookie.value)),
      consentGiven: true,
      consentVersion: LEAD_CONSENT_VERSION,
      isSpam: formData.get(HONEYPOT_FIELD) !== "",
    },
  });
}

function clientIp(forwardedFor: string | null): string | null {
  if (forwardedFor === null) {
    return null;
  }
  const first = forwardedFor.split(",")[0].trim();
  return first === "" ? null : first;
}
