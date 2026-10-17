import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { useMessages, useTranslations, type Messages } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { JSX } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routes } from "@/lib/routes";
import { buildPageMetadata } from "@/lib/site";
import styles from "./page.module.css";

interface AboutFact {
  title: string;
  text: string;
  mobileText: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = await getLocale();
  const t = await getTranslations("about");
  return { title: t("metaTitle"), ...buildPageMetadata(locale, routes.about) };
}

export default function AboutPage(): JSX.Element {
  const t = useTranslations("about");
  const page: Messages["about"] = useMessages().about;
  return (
    <>
      <section className={styles.intro}>
        <div className={styles.inner}>
          <div>
            <div className={styles.eyebrow}>{t("eyebrow")}</div>
            <h1 className={styles.title}>{t("title")}</h1>
          </div>
          <div className={styles.text}>
            <p className={styles.lead}>{t("lead")}</p>
            {page.paragraphs.map((paragraph: string) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.israel}>
        <div className={`${styles.inner} ${styles.israelInner}`}>
          <h2 className={styles.israelTitle}>{t("israel.title")}</h2>
          {page.israel.facts.map((fact: AboutFact) => (
            <div key={fact.title}>
              <h3 className={styles.factTitle}>{fact.title}</h3>
              <p className={`${styles.factText} ${styles.factTextDesktop}`}>{fact.text}</p>
              <p className={`${styles.factText} ${styles.factTextMobile}`}>{fact.mobileText}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cards}>
        <div className={`${styles.inner} ${styles.cardsInner}`}>
          <Link href={routes.shippers} className={`${styles.card} ${styles.cardShipper}`}>
            <span>
              <span className={styles.cardEyebrow}>{t("shipperCard.eyebrow")}</span>
              <span className={styles.cardTitle}>{t("shipperCard.title")}</span>
            </span>
            <CardArrow />
          </Link>
          <Link href={routes.carriers} className={`${styles.card} ${styles.cardCarrier}`}>
            <span>
              <span className={styles.cardEyebrow}>{t("carrierCard.eyebrow")}</span>
              <span className={styles.cardTitle}>{t("carrierCard.title")}</span>
            </span>
            <CardArrow />
          </Link>
        </div>
      </section>
    </>
  );
}

function CardArrow(): JSX.Element {
  return (
    <span className={styles.cardArrow}>
      <span className={styles.arrowMobile}>
        <ArrowRight size={24} />
      </span>
      <span className={styles.arrowDesktop}>
        <ArrowRight size={28} />
      </span>
    </span>
  );
}
