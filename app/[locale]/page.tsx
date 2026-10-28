import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { ShipperCardForm, ShipperWideForm } from "@/components/forms/ShipperForms";
import { FaqSection } from "@/components/landing/FaqSection";
import { Hero } from "@/components/landing/Hero";
import { HowSection } from "@/components/landing/HowSection";
import { LeadCard } from "@/components/landing/LeadCard";
import landing from "@/components/landing/landing.module.css";
import type { Locale } from "@/i18n/routing";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = await getLocale();
  const t = await getTranslations("shippers");
  return { title: t("metaTitle"), ...buildPageMetadata(locale, routes.shippers) };
}

export default function ShippersPage(): JSX.Element {
  return (
    <div className={landing.page}>
      <Hero namespace="shippers" formWidth="narrow" form={<ShipperCardForm />} />
      <HowSection />
      <LeadCard namespace="shippers" className="" form={<ShipperWideForm />} />
      <FaqSection namespace="shippers" />
    </div>
  );
}
