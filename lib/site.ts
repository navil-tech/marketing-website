import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export const siteUrl: string = "https://navil.co.il";

type HrefLang = Locale | "x-default";

export interface Alternates {
  languages: Record<HrefLang, string>;
}

export function buildPageMetadata(locale: Locale, href: string): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      canonical: absoluteUrl(locale, href),
      languages: buildAlternates(href).languages,
    },
  };
}

export function buildAlternates(href: string): Alternates {
  const languages: Record<HrefLang, string> = {
    ru: absoluteUrl("ru", href),
    en: absoluteUrl("en", href),
    he: absoluteUrl("he", href),
    "x-default": absoluteUrl(routing.defaultLocale, href),
  };
  return { languages };
}

export function absoluteUrl(locale: Locale, href: string): string {
  return new URL(getPathname({ href, locale }), siteUrl).toString();
}
