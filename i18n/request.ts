import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { formats } from "./formats";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const resolved: string | undefined = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, resolved)) {
    notFound();
  }
  return {
    locale: resolved,
    timeZone: "Asia/Jerusalem",
    formats,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
