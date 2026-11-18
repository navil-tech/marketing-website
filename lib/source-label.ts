export interface SourceLabel {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

const LABEL_PARAMS: Record<keyof SourceLabel, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
};

const LABEL_KEYS = Object.keys(LABEL_PARAMS) as (keyof SourceLabel)[];

const MAX_VALUE_LENGTH = 255;

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;

export function readSourceLabel(params: URLSearchParams): SourceLabel {
  return {
    utmSource: readParam(params, LABEL_PARAMS.utmSource),
    utmMedium: readParam(params, LABEL_PARAMS.utmMedium),
    utmCampaign: readParam(params, LABEL_PARAMS.utmCampaign),
    utmTerm: readParam(params, LABEL_PARAMS.utmTerm),
    utmContent: readParam(params, LABEL_PARAMS.utmContent),
  };
}

export function hasLabel(label: SourceLabel): boolean {
  return LABEL_KEYS.some((key: keyof SourceLabel) => label[key] !== null);
}

export function isSameLabel(a: SourceLabel, b: SourceLabel): boolean {
  return LABEL_KEYS.every((key: keyof SourceLabel) => a[key] === b[key]);
}

function readParam(params: URLSearchParams, name: string): string | null {
  const value = params.get(name)?.replace(CONTROL_CHARACTERS, "").slice(0, MAX_VALUE_LENGTH);
  return value === undefined || value === "" ? null : value;
}
