import { z } from "zod";

export const ATTRIBUTION_COOKIE = "nv_attr";

export const ATTRIBUTION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const attributionSchema = z.object({
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmTerm: z.string().nullable(),
  utmContent: z.string().nullable(),
  gclid: z.string().nullable(),
  fbclid: z.string().nullable(),
  landingPath: z.string(),
  firstReferrer: z.string().nullable(),
  firstVisitAt: z.iso.datetime(),
});

export type Attribution = z.infer<typeof attributionSchema>;

export interface AttributionCookieOptions {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  secure: boolean;
}

export function captureAttribution(url: URL, referer: string | null, now: Date): Attribution {
  return {
    utmSource: url.searchParams.get("utm_source"),
    utmMedium: url.searchParams.get("utm_medium"),
    utmCampaign: url.searchParams.get("utm_campaign"),
    utmTerm: url.searchParams.get("utm_term"),
    utmContent: url.searchParams.get("utm_content"),
    gclid: url.searchParams.get("gclid"),
    fbclid: url.searchParams.get("fbclid"),
    landingPath: `${url.pathname}${url.search}`,
    firstReferrer: referer,
    firstVisitAt: now.toISOString(),
  };
}

export function serializeAttribution(attribution: Attribution): string {
  return JSON.stringify(attribution);
}

export function parseAttribution(raw: string): Attribution {
  return attributionSchema.parse(JSON.parse(raw));
}

export function attributionCookieOptions(secure: boolean): AttributionCookieOptions {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: ATTRIBUTION_MAX_AGE_SECONDS, secure };
}
