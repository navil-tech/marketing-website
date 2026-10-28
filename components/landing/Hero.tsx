import { ArrowDown } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
import type { JSX, ReactNode } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { routes } from "@/lib/routes";
import { Checklist } from "./Checklist";
import styles from "./landing.module.css";

export type LandingNamespace = "shippers" | "carriers";

interface HeroProps {
  namespace: LandingNamespace;
  formWidth: "narrow" | "wide";
  form: ReactNode;
}

export function Hero({ namespace, formWidth, form }: HeroProps): JSX.Element {
  const t = useTranslations(namespace);
  const checklist: string[] = useMessages()[namespace].checklist;
  return (
    <section className={styles.hero}>
      <div className={`${styles.heroInner} ${formWidth === "wide" ? styles.heroInnerWide : ""}`}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>{t("eyebrow")}</div>
          <h1 className={styles.heroTitle}>{t("title")}</h1>
          <p className={styles.heroLead}>{t("lead")}</p>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.heroCta}>
            {t("heroCta")}
            <ArrowDown size={18} strokeWidth={2.2} />
          </ButtonLink>
          <Checklist items={checklist} className={styles.heroChecklist} />
          <p className={styles.heroNote}>{t("note")}</p>
        </div>
        <div className={styles.heroFormSection}>{form}</div>
      </div>
    </section>
  );
}
