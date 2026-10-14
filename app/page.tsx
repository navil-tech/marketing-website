import type { Metadata } from "next";
import type { JSX } from "react";
import { ShipperCardForm, ShipperWideForm } from "@/components/forms/ShipperForms";
import { FaqSection } from "@/components/landing/FaqSection";
import { Hero } from "@/components/landing/Hero";
import { HowSection } from "@/components/landing/HowSection";
import { LeadCard } from "@/components/landing/LeadCard";
import landing from "@/components/landing/landing.module.css";
import { currentLocale, getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";

const dictionary: Dictionary = getDictionary(currentLocale);

export const metadata: Metadata = {
  title: dictionary.shippers.metaTitle,
};

export default function ShippersPage(): JSX.Element {
  const page = dictionary.shippers;
  return (
    <div className={landing.page}>
      <Hero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        ctaLabel={page.heroCta}
        checklist={page.checklist}
        note={page.note}
        formWidth="narrow"
        form={<ShipperCardForm fields={dictionary.fields} form={page.form} />}
      />
      <HowSection dictionary={page.how} />
      <LeadCard
        dictionary={page.leadCard}
        className=""
        form={<ShipperWideForm fields={dictionary.fields} form={page.form} card={page.leadCard} />}
      />
      <FaqSection dictionary={page.faq} />
    </div>
  );
}
