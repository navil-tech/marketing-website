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
  value: string;
  label: string;
}

interface AboutPrinciple {
  title: string;
  text: string;
}

interface AboutStep {
  label: string;
  title: string;
  text: string;
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
          <div className={styles.eyebrow}>{t("eyebrow")}</div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.lead}>{t("lead")}</p>
          <dl className={styles.facts}>
            {page.facts.map((fact: AboutFact) => (
              <div key={fact.label} className={styles.fact}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.band}>
        <div className={`${styles.inner} ${styles.split}`}>
          <h2 className={styles.sectionTitle}>{t("story.title")}</h2>
          <div className={styles.story}>
            {page.story.paragraphs.map((paragraph: string) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>{t("principles.title")}</h2>
          <ol className={styles.principles}>
            {page.principles.items.map((principle: AboutPrinciple, index: number) => (
              <li key={principle.title} className={styles.principle}>
                <span className={styles.principleNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleText}>{principle.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.band}>
        <div className={`${styles.inner} ${styles.split}`}>
          <h2 className={styles.sectionTitle}>{t("status.title")}</h2>
          <ol className={styles.steps}>
            {page.status.steps.map((step: AboutStep) => (
              <li key={step.label} className={styles.step}>
                <span className={styles.stepLabel}>{step.label}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.cards}>
        <div className={`${styles.inner} ${styles.cardsInner}`}>
          <Link href={routes.shippers} className={styles.card}>
            <span>
              <span className={styles.cardEyebrow}>{t("shipperCard.eyebrow")}</span>
              <span className={styles.cardTitle}>{t("shipperCard.title")}</span>
            </span>
            <CardArrow />
          </Link>
          <Link href={routes.carriers} className={styles.card}>
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
