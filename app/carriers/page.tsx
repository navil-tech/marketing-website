import type { Metadata } from "next";
import type { JSX } from "react";
import { CarrierCardForm, CarrierWideForm } from "@/components/forms/CarrierForms";
import { FaqSection } from "@/components/landing/FaqSection";
import { FeedSection } from "@/components/landing/FeedSection";
import { Hero } from "@/components/landing/Hero";
import { LeadCard } from "@/components/landing/LeadCard";
import landing from "@/components/landing/landing.module.css";
import { currentLocale, getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";

const dictionary: Dictionary = getDictionary(currentLocale);

export const metadata: Metadata = {
  title: dictionary.carriers.metaTitle,
};

export default function CarriersPage(): JSX.Element {
  const page = dictionary.carriers;
  return (
    <div className={landing.page}>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        ctaLabel={page.heroCta}
        checklist={page.checklist}
        note={page.note}
        formWidth="wide"
        form={<CarrierCardForm fields={dictionary.fields} form={page.form} />}
      />
      <FeedSection feed={page.feed} price={page.price} />
      <LeadCard
        dictionary={page.leadCard}
        className={landing.leadCardSectionTight}
        form={<CarrierWideForm fields={dictionary.fields} form={page.form} card={page.leadCard} />}
      />
      <FaqSection dictionary={page.faq} />
    </div>
  );
}
