import { ChevronRight, Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { JSX } from "react";
import { Link } from "@/i18n/navigation";
import { navOrder, navRoutes, routes, type NavKey } from "@/lib/routes";
import styles from "./Footer.module.css";

export function Footer(): JSX.Element {
  const t = useTranslations("footer");
  const nav = useTranslations("header.nav");
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <h2 className={styles.title}>{t("title")}</h2>
            <p className={styles.subtitle}>{t("subtitle")}</p>
          </div>
          <div className={styles.contacts}>
            <a href={routes.placeholder} className={styles.contact}>
              <span className={styles.contactIcon}>
                <Mail size={22} />
              </span>
              <span className={styles.contactText}>
                <span className={styles.contactLabel}>{t("emailLabel")}</span>
                <span className={styles.contactValue}>{t("emailValue")}</span>
              </span>
              <span className={styles.contactChevron}>
                <ChevronRight size={18} />
              </span>
            </a>
            <a href={routes.placeholder} className={styles.contact}>
              <span className={styles.contactIcon}>
                <MessageCircle size={22} />
              </span>
              <span className={styles.contactText}>
                <span className={styles.contactLabel}>{t("phoneLabel")}</span>
                <span className={styles.contactValue}>{t("phoneValue")}</span>
              </span>
              <span className={styles.contactChevron}>
                <ChevronRight size={18} />
              </span>
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.brandBlock}>
            <div className={styles.brand}>{t("brand")}</div>
            <p className={styles.description}>{t("description")}</p>
          </div>
          <div className={styles.columns}>
            <div className={styles.column}>
              <span className={styles.columnTitle}>{t("serviceTitle")}</span>
              {navOrder.map((key: NavKey) => (
                <Link key={key} href={navRoutes[key]} className={styles.columnLink}>
                  {nav(key)}
                </Link>
              ))}
            </div>
            <div className={styles.column}>
              <span className={styles.columnTitle}>{t("documentsTitle")}</span>
              <a href={routes.placeholder} className={styles.columnLink}>
                {t("privacy")}
              </a>
              <a href={routes.placeholder} className={styles.columnLink}>
                {t("terms")}
              </a>
            </div>
            <div className={`${styles.column} ${styles.contactColumn}`}>
              <span className={styles.columnTitle}>{t("contactTitle")}</span>
              <a href={routes.placeholder} className={styles.columnLink}>
                {t("whatsapp")}
              </a>
              <a href={routes.placeholder} className={styles.columnLink}>
                {t("email")}
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>{t("copyright")}</div>
      </div>
    </footer>
  );
}
