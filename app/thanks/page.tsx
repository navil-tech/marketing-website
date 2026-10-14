import type { Metadata } from "next";
import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { CheckIcon } from "@/components/icons/Icons";
import { currentLocale, getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./page.module.css";

const dictionary: Dictionary = getDictionary(currentLocale);

export const metadata: Metadata = {
  title: dictionary.thanks.metaTitle,
};

export default function ThanksPage(): JSX.Element {
  const page = dictionary.thanks;
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.iconMobile}>
            <CheckIcon size={30} strokeWidth={2.6} />
          </span>
          <span className={styles.iconDesktop}>
            <CheckIcon size={34} strokeWidth={2.6} />
          </span>
        </div>
        <h1 className={styles.title}>{page.title}</h1>
        <p className={styles.text}>
          {page.text.before}
          <a href={routes.placeholder} className={styles.link}>
            {page.text.link}
          </a>
          {page.text.after}
        </p>
        <ButtonLink href={routes.home} variant="secondary" size="md" className={styles.home}>
          {page.home}
        </ButtonLink>
      </div>
    </section>
  );
}
