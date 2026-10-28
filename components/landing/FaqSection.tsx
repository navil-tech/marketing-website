import { ArrowUp } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { Faq, type FaqItem } from "@/components/Faq/Faq";
import { routes } from "@/lib/routes";
import type { LandingNamespace } from "./Hero";
import styles from "./landing.module.css";

interface FaqSectionProps {
  namespace: LandingNamespace;
}

export function FaqSection({ namespace }: FaqSectionProps): JSX.Element {
  const t = useTranslations(namespace);
  const items: FaqItem[] = useMessages()[namespace].faq.items;
  return (
    <section className={styles.faq}>
      <div className={styles.faqInner}>
        <div>
          <h2 className={styles.sectionTitle}>{t("faq.title")}</h2>
          <p className={styles.faqText}>{t("faq.text")}</p>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.faqCtaDesktop}>
            {t("faq.cta")}
            <ArrowUp size={18} strokeWidth={2.2} />
          </ButtonLink>
        </div>
        <div>
          <Faq items={items} />
          <ButtonLink
            href={routes.form}
            variant="primary"
            size="md"
            className={`${styles.blockCta} ${styles.faqCtaMobile}`}
          >
            {t("faq.cta")}
            <ArrowUp size={18} strokeWidth={2.2} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
