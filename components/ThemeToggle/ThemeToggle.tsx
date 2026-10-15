"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { JSX } from "react";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  label: string;
  iconSize: number;
  bordered: boolean;
}

export function ThemeToggle({ label, iconSize, bordered }: ThemeToggleProps): JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();

  // both icons are always rendered and css picks one by `data-theme`, so the markup is hydration-safe
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`${styles.toggle} ${bordered ? styles.bordered : ""}`}
    >
      <span className={styles.sun}>
        <Sun size={iconSize} />
      </span>
      <span className={styles.moon}>
        <Moon size={iconSize} />
      </span>
    </button>
  );
}
