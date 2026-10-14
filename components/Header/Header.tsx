"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { ChevronRightIcon, CloseIcon, LogoMark, MenuIcon } from "@/components/icons/Icons";
import type { ActiveNav, HeaderDictionary, Locale, NavKey } from "@/lib/i18n/types";
import { navOrder, navRoutes, routes } from "@/lib/routes";
import styles from "./Header.module.css";

interface HeaderProps {
  dictionary: HeaderDictionary;
  locale: Locale;
}

const languageOrder: Locale[] = ["ru", "en", "he"];

function resolveActiveNav(pathname: string): ActiveNav {
  if (pathname === routes.shippers) return "shippers";
  if (pathname === routes.carriers) return "carriers";
  if (pathname === routes.about) return "about";
  return "none";
}

export function Header({ dictionary, locale }: HeaderProps): JSX.Element {
  const pathname: string = usePathname();
  const active: ActiveNav = resolveActiveNav(pathname);
  // the menu remembers the path it was opened on, so navigating anywhere closes it
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
          {dictionary.brand}
        </Link>

        <nav className={styles.nav}>
          {navOrder.map((key: NavKey) => (
            <Link
              key={key}
              href={navRoutes[key]}
              className={`${styles.navLink} ${active === key ? styles.navLinkActive : ""}`}
            >
              {dictionary.nav[key]}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.langs}>
            {languageOrder.map((lang: Locale) => (
              <a
                key={lang}
                href={routes.placeholder}
                lang={lang === "he" ? "he" : undefined}
                className={`${styles.lang} ${lang === locale ? styles.langActive : ""}`}
              >
                {dictionary.languages[lang]}
              </a>
            ))}
          </div>
          <ThemeToggle label={dictionary.themeToggle} iconSize={18} bordered={true} />
          <ButtonLink href={routes.carriers} variant="secondary" size="sm" className="">
            {dictionary.carrierCta}
          </ButtonLink>
          <ButtonLink href={routes.shippers} variant="primary" size="sm" className="">
            {dictionary.shipperCta}
          </ButtonLink>
        </div>

        <span className={styles.themeToggle}>
          <ThemeToggle label={dictionary.themeToggle} iconSize={20} bordered={false} />
        </span>
        <button
          type="button"
          aria-label={isOpen ? dictionary.closeMenu : dictionary.openMenu}
          aria-expanded={isOpen}
          aria-controls="m-menu"
          onClick={() => setOpenedOnPath(isOpen ? null : pathname)}
          className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
        >
          {isOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {isOpen && (
        <nav id="m-menu" aria-label={dictionary.menuLabel} className={styles.menu}>
          {navOrder.map((key: NavKey) => (
            <Link
              key={key}
              href={navRoutes[key]}
              aria-current={active === key ? "page" : undefined}
              className={`${styles.menuLink} ${active === key ? styles.menuLinkActive : ""}`}
            >
              <span className={styles.menuLinkLabel}>
                <span className={styles.menuDot} />
                {dictionary.nav[key]}
              </span>
              <span className={styles.menuChevron}>
                <ChevronRightIcon size={18} />
              </span>
            </Link>
          ))}

          <div className={styles.langLabel}>{dictionary.language}</div>
          <div role="group" aria-label={dictionary.languageGroup} className={styles.langGroup}>
            {languageOrder.map((lang: Locale) => (
              <a
                key={lang}
                href={routes.placeholder}
                lang={lang === "he" ? "he" : undefined}
                aria-current={lang === locale ? "true" : undefined}
                className={`${styles.langChip} ${lang === locale ? styles.langChipActive : ""}`}
              >
                {dictionary.languagesLong[lang]}
              </a>
            ))}
          </div>

          <div className={styles.menuButtons}>
            <ButtonLink href={routes.shippers} variant="primary" size="md" className={styles.menuCta}>
              {dictionary.shipperCta}
            </ButtonLink>
            <ButtonLink href={routes.carriers} variant="secondary" size="md" className={styles.menuCtaSecondary}>
              {dictionary.carrierCta}
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
