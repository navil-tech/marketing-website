import {
  chromium,
  devices,
  firefox,
  request as apiRequest,
  webkit,
  type Browser,
  type BrowserContext,
  type BrowserType,
  type Page,
  type Request,
} from "playwright";
import { getPrisma } from "@/lib/db";
import { SESSION_COOKIE, sessionTimeoutSeconds } from "@/lib/sessions";
import { CLIENT_IP_HEADER } from "./gateway";
import { CONTROL_MAILBOX, NAV_MARKER, SCENARIO_MARKER } from "./hypothesis";
import type { NavRecord, SubmitRecord } from "./journal";
import type { Engine, Entry, FormKind, FormPosition, LabelVariant, Profile } from "./matrix";
import { engines, runId } from "./settings";

export const BOT_NAV = 0;

export const NEIGHBOUR_NAV = 101;

const BROWSER_TYPES: Record<Engine, BrowserType> = { chromium, firefox, webkit };

const browsers = new Map<Engine, Promise<Browser>>();

export class Trace {
  readonly navs: NavRecord[] = [];
  readonly posts: number[] = [];

  attach(context: BrowserContext): void {
    context.on("request", (request: Request) => {
      const sentAt = Date.now();
      if (request.method() === "POST") {
        this.posts.push(sentAt);
        return;
      }
      if (!request.isNavigationRequest()) {
        return;
      }
      const nav = new URL(request.url()).searchParams.get(NAV_MARKER);
      if (nav !== null && !this.navs.some((record: NavRecord) => record.nav === Number(nav))) {
        this.navs.push({ nav: Number(nav), url: request.url(), sentAt });
      }
    });
  }
}

export async function delayPosts(page: Page, delayMs: number): Promise<void> {
  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST") {
      await sleep(delayMs);
    }
    await route.continue();
  });
}

export function resolveEngine(planned: Engine): Engine {
  return engines.includes(planned) ? planned : engines[0];
}

export async function launchBrowsers(planned: Engine[]): Promise<void> {
  for (const engine of new Set(planned.map(resolveEngine))) {
    try {
      await browserFor(engine);
    } catch (error) {
      throw new Error(`engine ${engine} failed to launch, list only working engines in CONTROL_ENGINES`, {
        cause: error,
      });
    }
  }
}

function browserFor(engine: Engine): Promise<Browser> {
  const existing = browsers.get(engine);
  if (existing !== undefined) {
    return existing;
  }
  const launched = BROWSER_TYPES[engine].launch();
  browsers.set(engine, launched);
  return launched;
}

export async function openContext(
  engine: Engine,
  profile: Profile,
  entry: Entry,
  clientIp: string,
  options: { javaScript: boolean },
): Promise<BrowserContext> {
  const browser = await browserFor(engine);
  const descriptor = devices[profile.device];
  const supportsMobile = engine !== "firefox";
  return browser.newContext({
    ...descriptor,
    isMobile: supportsMobile ? descriptor.isMobile : false,
    locale: entry.browserLocale,
    javaScriptEnabled: options.javaScript,
    extraHTTPHeaders: { [CLIENT_IP_HEADER]: clientIp },
  });
}

function buildUrl(base: string, path: string, scenarioId: string, nav: number, label: LabelVariant): string {
  const url = new URL(path, base);
  const params: [string, string | null][] = [
    ["utm_source", label.label.utmSource],
    ["utm_medium", label.label.utmMedium],
    ["utm_campaign", label.label.utmCampaign],
    ["utm_term", label.label.utmTerm],
    ["utm_content", label.label.utmContent],
  ];
  for (const [name, value] of params) {
    if (value !== null) {
      url.searchParams.set(name, value);
    }
  }
  for (const [name, value] of Object.entries(label.extraQuery)) {
    url.searchParams.set(name, value);
  }
  url.searchParams.set(SCENARIO_MARKER, `${runId}-${scenarioId}`);
  url.searchParams.set(NAV_MARKER, String(nav));
  return url.toString();
}

export async function enter(
  page: Page,
  base: string,
  path: string,
  scenarioId: string,
  nav: number,
  label: LabelVariant,
  javaScript: boolean,
): Promise<void> {
  await page.goto(buildUrl(base, path, scenarioId, nav, label), {
    referer: label.referer ?? undefined,
    waitUntil: javaScript ? "networkidle" : "load",
  });
}

export async function botVisit(
  base: string,
  path: string,
  scenarioId: string,
  label: LabelVariant,
  userAgent: string,
  clientIp: string,
): Promise<string> {
  const url = buildUrl(base, path, scenarioId, BOT_NAV, label);
  const client = await apiRequest.newContext({ userAgent, extraHTTPHeaders: { [CLIENT_IP_HEADER]: clientIp } });
  await client.get(url);
  await client.dispose();
  return url;
}

export async function clickNav(
  page: Page,
  entry: Entry,
  profile: Profile,
  target: "about" | "carriers" | "shippers",
): Promise<void> {
  const prefix = entry.locale === "en" ? "" : `/${entry.locale}`;
  const href = target === "shippers" ? prefix || "/" : `${prefix}/${target}`;
  if (profile.desktop) {
    await page.locator(`header nav:not(#m-menu) a[href="${href}"]`).first().click();
  } else {
    await page.locator('header button[aria-controls="m-menu"]').click();
    await page.locator(`#m-menu a[href="${href}"]`).first().click();
  }
  await page.waitForURL((url: URL) => url.pathname === href);
  await page.waitForLoadState("networkidle");
}

export async function submit(
  page: Page,
  context: BrowserContext,
  trace: Trace,
  kind: FormKind,
  position: FormPosition,
  email: string,
  fillHoneypot: boolean,
): Promise<SubmitRecord> {
  const form = page.locator(position === "card" ? "form#form" : "form:not(#form)").first();
  await form.locator('input[name="name"]').fill("Control Scenario");
  await form.locator('input[name="email"]').fill(email);
  await form.locator('select[name="region"]').selectOption("TEL_AVIV");
  if (kind === "CARRIER") {
    await form.locator('input[name="vehicle"]').fill("Control van 3 t");
  }
  if (fillHoneypot) {
    await form.locator('input[name="website"]').evaluate((input: HTMLInputElement) => {
      input.value = "https://spam.example";
    });
  }
  await form.locator('input[name="consent"]').check();
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === SESSION_COOKIE)?.value ?? null;
  const postsBefore = trace.posts.length;
  await form.locator('button[type="submit"]').click();
  await page.waitForURL(/\/thanks/);
  return { email, kind, sentAt: trace.posts[postsBefore], sessionCookie };
}

export async function expireSession(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies();
  const sessionId = cookies.find((cookie) => cookie.name === SESSION_COOKIE)?.value;
  if (sessionId === undefined) {
    throw new Error("session cookie is missing");
  }
  const shift = sessionTimeoutSeconds() + 60;
  await getPrisma()
    .$executeRaw`UPDATE "Session" SET "lastSeenAt" = "lastSeenAt" - make_interval(secs => ${shift}::double precision) WHERE "id" = ${sessionId}`;
}

export function leadEmail(scenarioId: string, suffix: string): string {
  return `${scenarioId.toLowerCase()}-${suffix}-${runId}@${CONTROL_MAILBOX}`;
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function closeBrowsers(): Promise<void> {
  for (const browser of browsers.values()) {
    await (await browser).close();
  }
}
