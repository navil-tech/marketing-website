"use server";

import { redirect } from "next/navigation";
import { parseCarrierApplication, parseShipperLead, type CarrierApplication, type ShipperLead } from "@/lib/leads";
import { routes } from "@/lib/routes";

/** stub: there is no backend yet, the lead is validated and dropped */
export async function submitShipperLead(formData: FormData): Promise<void> {
  const lead: ShipperLead = parseShipperLead(formData);
  void lead;
  redirect(routes.thanks);
}

/** stub: there is no backend yet, the application is validated and dropped */
export async function submitCarrierApplication(formData: FormData): Promise<void> {
  const application: CarrierApplication = parseCarrierApplication(formData);
  void application;
  redirect(routes.thanks);
}
