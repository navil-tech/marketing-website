import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type { JSX, ReactNode } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { routes } from "@/lib/routes";
import type { LandingNamespace } from "./Hero";
import styles from "./landing.module.css";

interface LeadCardProps {
  namespace: LandingNamespace;
  className: string;
  form: ReactNode;
}

export function LeadCard({ namespace, className, form }: LeadCardProps): JSX.Element {
  const t = useTranslations(namespace);
  return (
    <section className={`${styles.leadCardSection} ${className}`}>
      <div className={styles.leadCard}>
        <div>
          <div className={styles.leadCardEyebrow}>{t("leadCard.eyebrow")}</div>
          <h2 className={styles.leadCardTitle}>{t("leadCard.title")}</h2>
          <p className={styles.leadCardText}>{t("leadCard.text")}</p>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.leadCardCta}>
            {t("leadCard.mobileCta")}
            <ArrowUp size={18} strokeWidth={2.2} />
          </ButtonLink>
        </div>
        <div className={styles.leadCardForm}>{form}</div>
      </div>
    </section>
  );
}
