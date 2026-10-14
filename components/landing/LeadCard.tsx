import type { JSX, ReactNode } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { ArrowUpIcon } from "@/components/icons/Icons";
import type { LeadCardDictionary } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./landing.module.css";

interface LeadCardProps {
  dictionary: LeadCardDictionary;
  className: string;
  form: ReactNode;
}

export function LeadCard({ dictionary, className, form }: LeadCardProps): JSX.Element {
  return (
    <section className={`${styles.leadCardSection} ${className}`}>
      <div className={styles.leadCard}>
        <div>
          <div className={styles.leadCardEyebrow}>{dictionary.eyebrow}</div>
          <h2 className={styles.leadCardTitle}>{dictionary.title}</h2>
          <p className={styles.leadCardText}>{dictionary.text}</p>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.leadCardCta}>
            {dictionary.mobileCta}
            <ArrowUpIcon size={18} />
          </ButtonLink>
        </div>
        <div className={styles.leadCardForm}>{form}</div>
      </div>
    </section>
  );
}
