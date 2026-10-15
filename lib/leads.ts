import { z } from "zod";

const shipperLeadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email().trim(),
  phone: z.string().trim(),
  region: z.string().trim().min(1),
});

const carrierApplicationSchema = shipperLeadSchema.extend({
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
