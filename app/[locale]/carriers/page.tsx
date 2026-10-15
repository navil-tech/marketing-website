import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { CarrierCardForm, CarrierWideForm } from "@/components/forms/CarrierForms";
import { FaqSection } from "@/components/landing/FaqSection";
import { FeedSection } from "@/components/landing/FeedSection";
import { Hero } from "@/components/landing/Hero";
import { LeadCard } from "@/components/landing/LeadCard";
import landing from "@/components/landing/landing.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("carriers");
  return { title: t("metaTitle") };
}

export default function CarriersPage(): JSX.Element {
  return (
    <div className={landing.page}>
      <Hero namespace="carriers" formWidth="wide" form={<CarrierCardForm />} />
      <FeedSection />
      <LeadCard namespace="carriers" className={landing.leadCardSectionTight} form={<CarrierWideForm />} />
      <FaqSection namespace="carriers" />
    </div>
  );
}
