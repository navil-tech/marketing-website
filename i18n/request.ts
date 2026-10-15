import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // an explicit locale is passed by server actions, where root params are unavailable
  const resolved: string | undefined = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, resolved)) {
    notFound();
  }
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
