import type { Page } from "playwright";
import {
  BOT_NAV,
  botVisit,
  clickNav,
  delayPosts,
  enter,
  expireSession,
  leadEmail,
  NEIGHBOUR_NAV,
  openContext,
  resolveEngine,
  submit,
  Trace,
} from "./browser";
import type { JournalEntry, SubmitRecord } from "./journal";
import { UNTAGGED, type BoundaryScenario, type LabelVariant, type Scenario } from "./matrix";

export async function runScenario(base: string, scenario: Scenario): Promise<JournalEntry> {
  const engine = resolveEngine(scenario.profile.engine);
  const entry: JournalEntry = {
    scenario: scenario.id,
    class: scenario.class,
    boundary: false,
    profile: scenario.profile.id,
    plannedEngine: scenario.profile.engine,
    actualEngine: engine,
    clientIp: scenario.clientIp,
    expected: scenario.expected,
    navs: [],
    submits: [],
    error: null,
  };
  const trace = new Trace();
  const context = await openContext(engine, scenario.profile, scenario.entry, scenario.clientIp, {
    javaScript: scenario.class !== "no-js",
  });
  trace.attach(context);
  try {
    const page = await context.newPage();
    const visit = (nav: number, label: LabelVariant, target: Page): Promise<void> =>
      enter(target, base, scenario.entry.path, scenario.id, nav, label, scenario.class !== "no-js");
    const send = (suffix: string): Promise<SubmitRecord> =>
      submit(page, context, trace, scenario.form, scenario.position, leadEmail(scenario.id, suffix), false);

    if (scenario.class === "preview-bot") {
      await botVisit(base, scenario.entry.path, scenario.id, scenario.label, scenario.botUserAgent, scenario.clientIp);
    }
    if (scenario.class === "latency") {
      await delayPosts(page, scenario.delayMs);
    }
    await visit(1, scenario.label, page);

    if (scenario.class === "browse") {
      await clickNav(page, scenario.entry, scenario.profile, "about");
      await clickNav(page, scenario.entry, scenario.profile, scenario.form === "CARRIER" ? "carriers" : "shippers");
    }
    if (scenario.class === "reload") {
      await page.reload({ waitUntil: "networkidle" });
    }
    if (scenario.class === "cross-page") {
      await clickNav(page, scenario.entry, scenario.profile, "carriers");
    }
    if (scenario.class === "multi-tab") {
      const second = await context.newPage();
      await visit(2, scenario.secondLabel, second);
    }
    if (scenario.class === "relabel") {
      await visit(2, scenario.secondLabel, page);
    }
    if (scenario.class === "timeout") {
      await expireSession(context);
      await visit(2, UNTAGGED, page);
    }
    if (scenario.class === "late-submit") {
      await expireSession(context);
    }
    if (scenario.class === "shared-nat") {
      const neighbour = await openContext(engine, scenario.profile, scenario.entry, scenario.clientIp, {
        javaScript: true,
      });
      const neighbourPage = await neighbour.newPage();
      await enter(neighbourPage, base, scenario.entry.path, scenario.id, NEIGHBOUR_NAV, scenario.secondLabel, true);
      await neighbour.close();
    }
    if (scenario.class === "repeat-submit") {
      entry.submits.push(await send("first"));
      await page.goBack({ waitUntil: "networkidle" });
    }
    entry.submits.push(await send("lead"));
  } catch (error) {
    entry.error = error instanceof Error ? error.message.split("\n")[0] : String(error);
  }
  entry.navs = trace.navs;
  await context.close();
  return entry;
}

export async function runBoundary(base: string, scenario: BoundaryScenario): Promise<JournalEntry> {
  const engine = resolveEngine(scenario.profile.engine);
  const entry: JournalEntry = {
    scenario: scenario.id,
    class: scenario.class,
    boundary: true,
    profile: scenario.profile.id,
    plannedEngine: scenario.profile.engine,
    actualEngine: engine,
    clientIp: scenario.clientIp,
    expected: null,
    navs: [],
    submits: [],
    error: null,
  };
  if (scenario.class === "bot-visit") {
    const sentAt = Date.now();
    const url = await botVisit(
      base,
      scenario.entry.path,
      scenario.id,
      scenario.label,
      scenario.botUserAgent,
      scenario.clientIp,
    );
    entry.navs = [{ nav: BOT_NAV, url, sentAt }];
    return entry;
  }
  const trace = new Trace();
  const context = await openContext(engine, scenario.profile, scenario.entry, scenario.clientIp, { javaScript: true });
  trace.attach(context);
  try {
    const page = await context.newPage();
    if (scenario.class === "slow-submit") {
      await delayPosts(page, scenario.delayMs);
    }
    await enter(page, base, scenario.entry.path, scenario.id, 1, scenario.label, true);
    if (scenario.class === "cookies-cleared") {
      await context.clearCookies();
    }
    entry.submits.push(
      await submit(
        page,
        context,
        trace,
        scenario.form,
        "card",
        leadEmail(scenario.id, "lead"),
        scenario.class === "honeypot",
      ),
    );
  } catch (error) {
    entry.error = error instanceof Error ? error.message.split("\n")[0] : String(error);
  }
  entry.navs = trace.navs;
  await context.close();
  return entry;
}
