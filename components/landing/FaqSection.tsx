import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { Faq } from "@/components/Faq/Faq";
import { ArrowUpIcon } from "@/components/icons/Icons";
import type { FaqDictionary } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./landing.module.css";

interface FaqSectionProps {
  dictionary: FaqDictionary;
}

export function FaqSection({ dictionary }: FaqSectionProps): JSX.Element {
  return (
    <section className={styles.faq}>
      <div className={styles.faqInner}>
        <div>
          <h2 className={styles.sectionTitle}>{dictionary.title}</h2>
          <p className={styles.faqText}>{dictionary.text}</p>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.faqCtaDesktop}>
            {dictionary.cta}
            <ArrowUpIcon size={18} />
          </ButtonLink>
        </div>
        <div>
          <Faq items={dictionary.items} />
          <ButtonLink href={routes.form} variant="primary" size="md" className={`${styles.blockCta} ${styles.faqCtaMobile}`}>
            {dictionary.cta}
            <ArrowUpIcon size={18} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
