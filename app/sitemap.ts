import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { routes } from "@/lib/routes";
import { absoluteUrl, buildAlternates } from "@/lib/site";

const indexedHrefs: readonly string[] = [routes.shippers, routes.carriers, routes.about];

export default function sitemap(): MetadataRoute.Sitemap {
  return indexedHrefs.flatMap((href: string) =>
    routing.locales.map((locale: Locale) => ({
      url: absoluteUrl(locale, href),
      alternates: buildAlternates(href),
    })),
  );
}
