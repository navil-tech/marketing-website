"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { LogoMark } from "@/components/icons/LogoMark";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { navOrder, navRoutes, routes, type NavKey } from "@/lib/routes";
import styles from "./Header.module.css";

type ActiveNav = NavKey | "none";

function resolveActiveNav(pathname: string): ActiveNav {
  if (pathname === routes.shippers) return "shippers";
  if (pathname === routes.carriers) return "carriers";
  if (pathname === routes.about) return "about";
  return "none";
}

export function Header(): JSX.Element {
  const t = useTranslations("header");
  const locale: Locale = useLocale();
  const pathname: string = usePathname();
  const active: ActiveNav = resolveActiveNav(pathname);
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);
  const isOpen: boolean = openedOnPath === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpenedOnPath(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href={routes.home} className={styles.logo}>
          <span className={styles.logoMarkMobile}>
            <LogoMark size={28} />
          </span>
          <span className={styles.logoMarkDesktop}>
            <LogoMark size={30} />
          </span>
          {t("brand")}
        </Link>

        <nav className={styles.nav}>
          {navOrder.map((key: NavKey) => (
            <Link
              key={key}
              href={navRoutes[key]}
              className={`${styles.navLink} ${active === key ? styles.navLinkActive : ""}`}
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.langs}>
            {routing.locales.map((lang: Locale) => (
              <Link
                key={lang}
                href={pathname}
                locale={lang}
                lang={lang}
                className={`${styles.lang} ${lang === locale ? styles.langActive : ""}`}
              >
                {t(`languages.${lang}`)}
              </Link>
            ))}
          </div>
          <ThemeToggle label={t("themeToggle")} iconSize={18} bordered={true} />
          <ButtonLink href={routes.carriers} variant="secondary" size="sm" className="">
            {t("carrierCta")}
          </ButtonLink>
          <ButtonLink href={routes.shippers} variant="primary" size="sm" className="">
            {t("shipperCta")}
          </ButtonLink>
        </div>

        <span className={styles.themeToggle}>
          <ThemeToggle label={t("themeToggle")} iconSize={20} bordered={false} />
        </span>
        <button
          type="button"
          aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={isOpen}
          aria-controls="m-menu"
          onClick={() => setOpenedOnPath(isOpen ? null : pathname)}
          className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <nav id="m-menu" aria-label={t("menuLabel")} className={styles.menu}>
          {navOrder.map((key: NavKey) => (
            <Link
              key={key}
              href={navRoutes[key]}
              aria-current={active === key ? "page" : undefined}
              className={`${styles.menuLink} ${active === key ? styles.menuLinkActive : ""}`}
            >
              <span className={styles.menuLinkLabel}>
                <span className={styles.menuDot} />
                {t(`nav.${key}`)}
              </span>
              <span className={styles.menuChevron}>
                <ChevronRight size={18} />
              </span>
            </Link>
          ))}

          <div className={styles.langLabel}>{t("language")}</div>
          <div role="group" aria-label={t("languageGroup")} className={styles.langGroup}>
            {routing.locales.map((lang: Locale) => (
              <Link
                key={lang}
                href={pathname}
                locale={lang}
                lang={lang}
                aria-current={lang === locale ? "true" : undefined}
                className={`${styles.langChip} ${lang === locale ? styles.langChipActive : ""}`}
              >
                {t(`languagesLong.${lang}`)}
              </Link>
            ))}
          </div>

          <div className={styles.menuButtons}>
            <ButtonLink href={routes.shippers} variant="primary" size="md" className={styles.menuCta}>
              {t("shipperCta")}
            </ButtonLink>
            <ButtonLink href={routes.carriers} variant="secondary" size="md" className={styles.menuCtaSecondary}>
              {t("carrierCta")}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
