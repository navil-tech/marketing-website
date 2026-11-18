"use server";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { HONEYPOT_FIELD } from "@/components/forms/Honeypot";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { LeadKind } from "@/lib/generated/prisma/client";
import { receiveForm, saveLead, type FormRequest } from "@/lib/lead-submission";
import { LEAD_CONSENT_VERSION, parseCarrierApplication, parseShipperLead, type CarrierApplication } from "@/lib/leads";
import { deliverNotification } from "@/lib/notifications";
import { routes } from "@/lib/routes";
import { clientIp, readSessionId, SESSION_COOKIE } from "@/lib/sessions";

type LeadFields = Omit<CarrierApplication, "consent" | "vehicle"> & { vehicle: string | null };

export async function submitShipperLead(locale: Locale, formData: FormData): Promise<void> {
  const request = await readFormRequest("SHIPPER");
  const lead = parseShipperLead(formData);
  await persistLead(request, locale, { ...lead, vehicle: null }, formData);
  redirect({ href: routes.thanks, locale });
}

export async function submitCarrierApplication(locale: Locale, formData: FormData): Promise<void> {
  const request = await readFormRequest("CARRIER");
  const application = parseCarrierApplication(formData);
  await persistLead(request, locale, application, formData);
  redirect({ href: routes.thanks, locale });
}

async function readFormRequest(kind: LeadKind): Promise<FormRequest> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  return receiveForm({
    kind,
    sessionId: readSessionId(cookieStore.get(SESSION_COOKIE)?.value),
    pageUrl: headerStore.get("referer"),
    userAgent: headerStore.get("user-agent"),
    ip: clientIp(headerStore.get("x-forwarded-for")),
    requestId: headerStore.get("x-request-id"),
  });
}

async function persistLead(
  request: FormRequest,
  locale: Locale,
  fields: LeadFields,
  formData: FormData,
): Promise<void> {
  const notificationId = await saveLead(request, {
    locale,
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    region: fields.region,
    vehicle: fields.vehicle,
    consentVersion: LEAD_CONSENT_VERSION,
    isSpam: formData.get(HONEYPOT_FIELD) !== "",
  });
  if (notificationId !== null) {
    after(() => deliverNotification(notificationId));
  }
}
