import type { JSX, ReactNode } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { ArrowDownIcon } from "@/components/icons/Icons";
import { routes } from "@/lib/routes";
import { Checklist } from "./Checklist";
import styles from "./landing.module.css";

interface HeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  ctaLabel: string;
  checklist: string[];
  note: string;
  formWidth: "narrow" | "wide";
  form: ReactNode;
}

export function Hero({ eyebrow, title, lead, ctaLabel, checklist, note, formWidth, form }: HeroProps): JSX.Element {
  return (
    <>
      <section className={styles.hero}>
        <div className={`${styles.heroInner} ${formWidth === "wide" ? styles.heroInnerWide : ""}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>{eyebrow}</div>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroLead}>{lead}</p>
            <ButtonLink href={routes.form} variant="primary" size="md" className={styles.heroCta}>
              {ctaLabel}
              <ArrowDownIcon size={18} />
            </ButtonLink>
            <Checklist items={checklist} className={styles.heroChecklist} />
            <p className={styles.heroNote}>{note}</p>
          </div>
          <div className={styles.heroFormSection}>{form}</div>
        </div>
      </section>
    </>
  );
}
