"use client";

import type { JSX } from "react";
import { MoonIcon, SunIcon } from "@/components/icons/Icons";
import { readTheme, writeTheme, type Theme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  label: string;
  iconSize: number;
  bordered: boolean;
}

export function ThemeToggle({ label, iconSize, bordered }: ThemeToggleProps): JSX.Element {
  const handleClick = (): void => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    writeTheme(next);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={`${styles.toggle} ${bordered ? styles.bordered : ""}`}
    >
      <span className={styles.sun}>
        <SunIcon size={iconSize} />
      </span>
      <span className={styles.moon}>
        <MoonIcon size={iconSize} />
      </span>
    </button>
  );
}
