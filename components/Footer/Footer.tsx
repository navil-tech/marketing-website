import Link from "next/link";
import type { JSX } from "react";
import { ChatIcon, ChevronRightIcon, MailIcon } from "@/components/icons/Icons";
import type { FooterDictionary, HeaderDictionary, NavKey } from "@/lib/i18n/types";
import { navOrder, navRoutes, routes } from "@/lib/routes";
import styles from "./Footer.module.css";

interface FooterProps {
  dictionary: FooterDictionary;
  nav: HeaderDictionary["nav"];
}

export function Footer({ dictionary, nav }: FooterProps): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <h2 className={styles.title}>{dictionary.title}</h2>
            <p className={styles.subtitle}>{dictionary.subtitle}</p>
          </div>
          <div className={styles.contacts}>
            <a href={routes.placeholder} className={styles.contact}>
              <span className={styles.contactIcon}>
                <MailIcon size={22} />
              </span>
              <span className={styles.contactText}>
                <span className={styles.contactLabel}>{dictionary.emailLabel}</span>
                <span className={styles.contactValue}>{dictionary.emailValue}</span>
              </span>
              <span className={styles.contactChevron}>
                <ChevronRightIcon size={18} />
              </span>
            </a>
            <a href={routes.placeholder} className={styles.contact}>
              <span className={styles.contactIcon}>
                <ChatIcon size={22} />
              </span>
              <span className={styles.contactText}>
                <span className={styles.contactLabel}>{dictionary.phoneLabel}</span>
                <span className={styles.contactValue}>{dictionary.phoneValue}</span>
              </span>
              <span className={styles.contactChevron}>
                <ChevronRightIcon size={18} />
              </span>
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.brandBlock}>
            <div className={styles.brand}>{dictionary.brand}</div>
            <p className={styles.description}>{dictionary.description}</p>
          </div>
          <div className={styles.columns}>
          <div className={styles.column}>
            <span className={styles.columnTitle}>{dictionary.serviceTitle}</span>
            {navOrder.map((key: NavKey) => (
              <Link key={key} href={navRoutes[key]} className={styles.columnLink}>
                {nav[key]}
              </Link>
            ))}
          </div>
          <div className={styles.column}>
            <span className={styles.columnTitle}>{dictionary.documentsTitle}</span>
            <a href={routes.placeholder} className={styles.columnLink}>
              {dictionary.privacy}
            </a>
            <a href={routes.placeholder} className={styles.columnLink}>
              {dictionary.terms}
            </a>
          </div>
          <div className={`${styles.column} ${styles.contactColumn}`}>
            <span className={styles.columnTitle}>{dictionary.contactTitle}</span>
            <a href={routes.placeholder} className={styles.columnLink}>
              {dictionary.whatsapp}
            </a>
            <a href={routes.placeholder} className={styles.columnLink}>
              {dictionary.email}
            </a>
          </div>
          </div>
        </div>

        <div className={styles.copyright}>{dictionary.copyright}</div>
      </div>
    </footer>
  );
}
