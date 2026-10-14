export interface ShipperLead {
  name: string;
  email: string;
  phone: string;
  region: string;
}

export interface CarrierApplication extends ShipperLead {
  vehicle: string;
}

export class MissingFieldError extends Error {
  readonly field: string;

  constructor(field: string) {
    super(`Required form field "${field}" is missing or empty`);
    this.name = "MissingFieldError";
    this.field = field;
  }
}

export function parseShipperLead(formData: FormData): ShipperLead {
  return {
    name: readRequired(formData, "name"),
    email: readRequired(formData, "email"),
    phone: readOptional(formData, "phone"),
    region: readRequired(formData, "region"),
  };
}

export function parseCarrierApplication(formData: FormData): CarrierApplication {
  return {
    ...parseShipperLead(formData),
    vehicle: readRequired(formData, "vehicle"),
  };
}

function readRequired(formData: FormData, field: string): string {
  const value: string = readOptional(formData, field);
  if (value === "") {
    throw new MissingFieldError(field);
  }
  return value;
}

function readOptional(formData: FormData, field: string): string {
  const value: FormDataEntryValue | null = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
