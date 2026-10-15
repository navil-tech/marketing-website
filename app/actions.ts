"use server";

import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { parseCarrierApplication, parseShipperLead, type CarrierApplication, type ShipperLead } from "@/lib/leads";
import { routes } from "@/lib/routes";

/** stub: there is no backend yet, the lead is validated and dropped */
export async function submitShipperLead(locale: Locale, formData: FormData): Promise<void> {
  const lead: ShipperLead = parseShipperLead(formData);
  void lead;
  redirect({ href: routes.thanks, locale });
}

/** stub: there is no backend yet, the application is validated and dropped */
export async function submitCarrierApplication(locale: Locale, formData: FormData): Promise<void> {
  const application: CarrierApplication = parseCarrierApplication(formData);
  void application;
  redirect({ href: routes.thanks, locale });
}
