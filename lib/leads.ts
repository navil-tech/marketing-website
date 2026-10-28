import { z } from "zod";
import { CARRIER_REGIONS, SHIPPER_REGIONS } from "@/lib/regions";

export const LEAD_CONSENT_VERSION = "2026-10-v1";

const shipperLeadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email().trim(),
  phone: z.string().trim().transform(emptyToNull),
  region: z.enum(SHIPPER_REGIONS),
  consent: z.literal("on"),
});

const carrierApplicationSchema = shipperLeadSchema.extend({
  region: z.enum(CARRIER_REGIONS),
  vehicle: z.string().trim().min(1),
});

export type ShipperLead = z.infer<typeof shipperLeadSchema>;

export type CarrierApplication = z.infer<typeof carrierApplicationSchema>;

export function parseShipperLead(formData: FormData): ShipperLead {
  return shipperLeadSchema.parse(Object.fromEntries(formData));
}

export function parseCarrierApplication(formData: FormData): CarrierApplication {
  return carrierApplicationSchema.parse(Object.fromEntries(formData));
}

function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}
