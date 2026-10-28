import createMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  ATTRIBUTION_COOKIE,
  attributionCookieOptions,
  captureAttribution,
  serializeAttribution,
} from "./lib/attribution";

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest): NextResponse {
  const response = handleI18n(request);
  const isDocument = request.headers.get("sec-fetch-dest") === "document";
  if (isDocument && !request.cookies.has(ATTRIBUTION_COOKIE)) {
    const attribution = captureAttribution(request.nextUrl, request.headers.get("referer"), new Date());
    response.cookies.set(
      ATTRIBUTION_COOKIE,
      serializeAttribution(attribution),
      attributionCookieOptions(process.env.NODE_ENV === "production"),
    );
  }
  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
