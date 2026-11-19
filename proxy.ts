import createMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  captureFirstTouch,
  FIRST_TOUCH_COOKIE,
  firstTouchCookieOptions,
  readFirstTouchCookie,
} from "./lib/first-touch";
import { pageRoutes } from "./lib/routes";
import { clientIp, readSessionId, resolveSession, SESSION_COOKIE, sessionCookieOptions } from "./lib/sessions";
import { readSourceLabel } from "./lib/source-label";

const handleI18n = createMiddleware(routing);

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = handleI18n(request);
  if (!isPageRequest(request)) {
    return response;
  }
  const url = request.nextUrl;
  const label = readSourceLabel(url.searchParams);
  const secure = request.headers.get("x-forwarded-proto") === "https";
  if (readFirstTouchCookie(request.cookies.get(FIRST_TOUCH_COOKIE)?.value) === null) {
    const firstTouch = JSON.stringify(captureFirstTouch(label, new Date()));
    response.cookies.set(FIRST_TOUCH_COOKIE, firstTouch, firstTouchCookieOptions(secure));
  }
  try {
    const sessionId = await resolveSession({
      sessionId: readSessionId(request.cookies.get(SESSION_COOKIE)?.value),
      path: `${url.pathname}${url.search}`,
      label,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
      ip: clientIp(request.headers.get("x-forwarded-for")),
      requestId: request.headers.get("x-request-id"),
    });
    response.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions(secure));
  } catch (error) {
    console.error("page request is not registered", error);
  }
  return response;
}

function isPageRequest(request: NextRequest): boolean {
  if (request.method !== "GET") {
    return false;
  }
  const destination = request.headers.get("sec-fetch-dest");
  if (destination !== null && destination !== "document") {
    return false;
  }
  const pathname = request.nextUrl.pathname.replace(LOCALE_PREFIX, "").replace(/\/$/, "");
  return pageRoutes.includes(pathname === "" ? "/" : pathname);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
