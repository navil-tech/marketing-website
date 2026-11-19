import { z } from "zod";
import type { SourceLabel } from "@/lib/source-label";

export const FIRST_TOUCH_COOKIE = "nv_ft";

const FIRST_TOUCH_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const firstTouchSchema = z.object({
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmTerm: z.string().nullable(),
  utmContent: z.string().nullable(),
  visitedAt: z.iso.datetime(),
});

export type FirstTouch = z.infer<typeof firstTouchSchema>;

export interface FirstTouchCookieOptions {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  secure: boolean;
}

export function captureFirstTouch(label: SourceLabel, now: Date): FirstTouch {
  return { ...label, visitedAt: now.toISOString() };
}

export function parseFirstTouch(value: unknown): FirstTouch | null {
  const parsed = firstTouchSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function readFirstTouchCookie(value: string | undefined): FirstTouch | null {
  if (value === undefined) {
    return null;
  }
  try {
    return parseFirstTouch(JSON.parse(value));
  } catch {
    return null;
  }
}

export function firstTouchCookieOptions(secure: boolean): FirstTouchCookieOptions {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge: FIRST_TOUCH_MAX_AGE_SECONDS, secure };
}
