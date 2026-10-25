import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "en", "he"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export type TextDirection = "ltr" | "rtl";

export const localeDirections: Record<Locale, TextDirection> = {
  ru: "ltr",
  en: "ltr",
  he: "rtl",
};
