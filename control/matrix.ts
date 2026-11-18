export type Engine = "chromium" | "firefox" | "webkit";

export type FormKind = "SHIPPER" | "CARRIER";

export type FormPosition = "card" | "wide";

export type ScenarioClass =
  | "direct"
  | "browse"
  | "reload"
  | "cross-page"
  | "multi-tab"
  | "relabel"
  | "timeout"
  | "late-submit"
  | "repeat-submit"
  | "preview-bot"
  | "shared-nat"
  | "latency"
  | "no-js";

export type BoundaryClass = "cookies-cleared" | "bot-visit" | "honeypot" | "slow-submit";

export interface Profile {
  id: string;
  engine: Engine;
  device: string;
  desktop: boolean;
}

export interface Label {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

export interface LabelVariant {
  id: string;
  label: Label;
  extraQuery: Record<string, string>;
  referer: string | null;
}

export interface Entry {
  locale: "en" | "ru" | "he";
  browserLocale: string;
  path: string;
}

export interface Scenario {
  id: string;
  class: ScenarioClass;
  profile: Profile;
  entry: Entry;
  form: FormKind;
  position: FormPosition;
  label: LabelVariant;
  secondLabel: LabelVariant;
  botUserAgent: string;
  delayMs: number;
  clientIp: string;
  expected: { entryNav: number; label: Label };
}

export interface BoundaryScenario {
  id: string;
  class: BoundaryClass;
  profile: Profile;
  entry: Entry;
  form: FormKind;
  label: LabelVariant;
  botUserAgent: string;
  delayMs: number;
  clientIp: string;
}

export const NO_LABEL: Label = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
};

export const PROFILES: Profile[] = [
  { id: "chrome-android", engine: "chromium", device: "Pixel 7", desktop: false },
  { id: "safari-iphone", engine: "webkit", device: "iPhone 14", desktop: false },
  { id: "chrome-desktop", engine: "chromium", device: "Desktop Chrome", desktop: true },
  { id: "safari-desktop", engine: "webkit", device: "Desktop Safari", desktop: true },
  { id: "firefox-desktop", engine: "firefox", device: "Desktop Firefox", desktop: true },
];

export const LABELS: LabelVariant[] = [
  {
    id: "full",
    label: {
      utmSource: "telegram",
      utmMedium: "chat",
      utmCampaign: "carriers_gushdan",
      utmTerm: "movers",
      utmContent: "pinned_post",
    },
    extraQuery: {},
    referer: null,
  },
  {
    id: "source-only",
    label: { ...NO_LABEL, utmSource: "whatsapp" },
    extraQuery: {},
    referer: null,
  },
  {
    id: "partner",
    label: { ...NO_LABEL, utmSource: "partner", utmMedium: "referral", utmCampaign: "store_01" },
    extraQuery: {},
    referer: null,
  },
  {
    id: "unicode",
    label: { ...NO_LABEL, utmSource: "Telegram", utmMedium: "Chat", utmCampaign: "Гуш-Дан ноябрь" },
    extraQuery: {},
    referer: null,
  },
  {
    id: "click-ids",
    label: { ...NO_LABEL, utmSource: "facebook", utmMedium: "cpc" },
    extraQuery: { fbclid: "IwAR0control", gclid: "Cj0KCQcontrol" },
    referer: null,
  },
  { id: "untagged", label: NO_LABEL, extraQuery: {}, referer: null },
  { id: "untagged-referer", label: NO_LABEL, extraQuery: {}, referer: "https://t.me/" },
];

export const UNTAGGED: LabelVariant = LABELS[5];

const SHIPPER_ENTRIES: Entry[] = [
  { locale: "ru", browserLocale: "ru-RU", path: "/ru" },
  { locale: "he", browserLocale: "he-IL", path: "/he" },
  { locale: "en", browserLocale: "en-US", path: "/" },
  { locale: "ru", browserLocale: "ru-RU", path: "/" },
  { locale: "he", browserLocale: "he-IL", path: "/" },
];

const CARRIER_ENTRIES: Entry[] = [
  { locale: "ru", browserLocale: "ru-RU", path: "/ru/carriers" },
  { locale: "he", browserLocale: "he-IL", path: "/he/carriers" },
  { locale: "en", browserLocale: "en-US", path: "/carriers" },
  { locale: "ru", browserLocale: "ru-RU", path: "/carriers" },
];

const BOT_USER_AGENTS: string[] = ["TelegramBot (like TwitterBot)", "WhatsApp/2.23.20.0 A"];

const CLASS_SIZES: [ScenarioClass, number][] = [
  ["direct", 30],
  ["browse", 8],
  ["reload", 5],
  ["cross-page", 5],
  ["multi-tab", 6],
  ["relabel", 6],
  ["timeout", 5],
  ["late-submit", 5],
  ["repeat-submit", 4],
  ["preview-bot", 6],
  ["shared-nat", 5],
  ["latency", 4],
  ["no-js", 4],
];

const LATENCY_DELAYS_MS: number[] = [400, 800];

const SLOW_SUBMIT_DELAY_MS = 1800;

export function buildMatrix(): Scenario[] {
  const scenarios: Scenario[] = [];
  for (const [scenarioClass, size] of CLASS_SIZES) {
    for (let index = 0; index < size; index += 1) {
      scenarios.push(buildScenario(scenarioClass, index, scenarios.length));
    }
  }
  return scenarios;
}

export function buildBoundarySet(): BoundaryScenario[] {
  const classes: BoundaryClass[] = [
    "cookies-cleared",
    "cookies-cleared",
    "bot-visit",
    "bot-visit",
    "honeypot",
    "honeypot",
    "slow-submit",
    "slow-submit",
  ];
  return classes.map((boundaryClass: BoundaryClass, index: number) => ({
    id: `X${String(index + 1).padStart(2, "0")}`,
    class: boundaryClass,
    profile: PROFILES[index % PROFILES.length],
    entry: SHIPPER_ENTRIES[index % 3],
    form: "SHIPPER",
    label: LABELS[index % 3],
    botUserAgent: BOT_USER_AGENTS[index % BOT_USER_AGENTS.length],
    delayMs: boundaryClass === "slow-submit" ? SLOW_SUBMIT_DELAY_MS : 0,
    clientIp: `203.0.113.${index + 1}`,
  }));
}

function buildScenario(scenarioClass: ScenarioClass, index: number, ordinal: number): Scenario {
  const profile = PROFILES[(index + ordinal) % PROFILES.length];
  const form: FormKind = scenarioClass === "cross-page" ? "CARRIER" : ordinal % 2 === 0 ? "SHIPPER" : "CARRIER";
  const entries = form === "CARRIER" && scenarioClass !== "cross-page" ? CARRIER_ENTRIES : SHIPPER_ENTRIES;
  const label = pickLabel(scenarioClass, index, ordinal);
  const secondLabel = LABELS[(index + 2) % 5 === LABELS.indexOf(label) ? (index + 3) % 5 : (index + 2) % 5];
  const secondTabTagged = scenarioClass === "multi-tab" && index % 2 === 1;
  const startsNewSession = scenarioClass === "relabel" || scenarioClass === "timeout" || secondTabTagged;
  const relabelled = scenarioClass === "relabel" || secondTabTagged;
  return {
    id: `S${String(ordinal + 1).padStart(2, "0")}`,
    class: scenarioClass,
    profile,
    entry: entries[(Math.floor(ordinal / 2) + index) % entries.length],
    form,
    position: profile.desktop && ordinal % 3 === 0 ? "wide" : "card",
    label,
    secondLabel: scenarioClass === "multi-tab" && !secondTabTagged ? UNTAGGED : secondLabel,
    botUserAgent: BOT_USER_AGENTS[index % BOT_USER_AGENTS.length],
    delayMs: scenarioClass === "latency" ? LATENCY_DELAYS_MS[index % LATENCY_DELAYS_MS.length] : 0,
    clientIp: `198.51.100.${ordinal + 1}`,
    expected: {
      entryNav: startsNewSession ? 2 : 1,
      label: relabelled ? secondLabel.label : scenarioClass === "timeout" ? NO_LABEL : label.label,
    },
  };
}

function pickLabel(scenarioClass: ScenarioClass, index: number, ordinal: number): LabelVariant {
  if (scenarioClass === "direct") {
    return LABELS[Math.floor(index / PROFILES.length) % 6];
  }
  if (
    scenarioClass === "relabel" ||
    scenarioClass === "timeout" ||
    scenarioClass === "shared-nat" ||
    scenarioClass === "multi-tab"
  ) {
    return LABELS[index % 5];
  }
  return LABELS[(index * 3 + ordinal) % LABELS.length];
}
