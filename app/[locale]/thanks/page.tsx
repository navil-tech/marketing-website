import { Check } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { JSX, ReactNode } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contacts";
import { routes } from "@/lib/routes";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("thanks");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default function ThanksPage(): JSX.Element {
  const t = useTranslations("thanks");
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.iconMobile}>
            <Check size={30} strokeWidth={2.6} />
          </span>
          <span className={styles.iconDesktop}>
            <Check size={34} strokeWidth={2.6} />
          </span>
        </div>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.text}>
          {t.rich("text", {
            email: SUPPORT_EMAIL,
            link: (chunks: ReactNode) => (
              <a href={SUPPORT_MAILTO} className={styles.link}>
                {chunks}
              </a>
            ),
          })}
        </p>
        <ButtonLink href={routes.home} variant="secondary" size="md" className={styles.home}>
          {t("home")}
        </ButtonLink>
      </div>
    </section>
  );
}
