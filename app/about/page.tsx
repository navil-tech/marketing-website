import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { ArrowRightIcon } from "@/components/icons/Icons";
import { currentLocale, getDictionary } from "@/lib/i18n";
import type { AboutFact, Dictionary } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./page.module.css";

const dictionary: Dictionary = getDictionary(currentLocale);

export const metadata: Metadata = {
  title: dictionary.about.metaTitle,
};

export default function AboutPage(): JSX.Element {
  const page = dictionary.about;
  return (
    <>
      <section className={styles.intro}>
        <div className={styles.inner}>
          <div>
            <div className={styles.eyebrow}>{page.eyebrow}</div>
            <h1 className={styles.title}>{page.title}</h1>
          </div>
          <div className={styles.text}>
            <p className={styles.lead}>{page.lead}</p>
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
          <h2 className={styles.israelTitle}>{page.israel.title}</h2>
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
              <span className={styles.cardEyebrow}>{page.shipperCard.eyebrow}</span>
              <span className={styles.cardTitle}>{page.shipperCard.title}</span>
            </span>
            <CardArrow />
          </Link>
          <Link href={routes.carriers} className={`${styles.card} ${styles.cardCarrier}`}>
            <span>
              <span className={styles.cardEyebrow}>{page.carrierCard.eyebrow}</span>
              <span className={styles.cardTitle}>{page.carrierCard.title}</span>
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
        <ArrowRightIcon size={24} />
      </span>
      <span className={styles.arrowDesktop}>
        <ArrowRightIcon size={28} />
      </span>
    </span>
  );
}
