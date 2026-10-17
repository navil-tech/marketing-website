import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** canonical production origin, the single source for canonical, hreflang, sitemap and robots URLs */
export const siteUrl: string = "https://navil.co.il";

type HrefLang = Locale | "x-default";

export interface Alternates {
  languages: Record<HrefLang, string>;
}

/** canonical + hreflang links for one page; each locale is canonical to itself, as Google requires */
export function buildPageMetadata(locale: Locale, href: string): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      canonical: absoluteUrl(locale, href),
      languages: buildAlternates(href).languages,
    },
  };
}

/** hreflang set for one page: every locale plus `x-default` pointing at the unprefixed default locale */
export function buildAlternates(href: string): Alternates {
  const languages: Record<HrefLang, string> = {
    ru: absoluteUrl("ru", href),
    en: absoluteUrl("en", href),
    he: absoluteUrl("he", href),
    "x-default": absoluteUrl(routing.defaultLocale, href),
  };
  return { languages };
}

/** absolute production URL of `href` in `locale`, with the locale prefix resolved by next-intl */
export function absoluteUrl(locale: Locale, href: string): string {
  return new URL(getPathname({ href, locale }), siteUrl).toString();
}
