import { defineRouting } from "next-intl/routing";

/** add a locale here together with its `messages/<locale>.json` and an entry in `localeDirections` */
export const routing = defineRouting({
  locales: ["ru", "en", "he"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export type TextDirection = "ltr" | "rtl";

export const localeDirections: Record<Locale, TextDirection> = {
  ru: "ltr",
  en: "ltr",
  he: "rtl",
};
