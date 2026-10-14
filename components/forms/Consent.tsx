import type { JSX } from "react";
import type { LinkedText } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./Consent.module.css";

interface ConsentProps {
  text: LinkedText;
  className: string;
}

export function Consent({ text, className }: ConsentProps): JSX.Element {
  return (
    <p className={`${styles.consent} ${className}`}>
      {text.before}
      <a href={routes.placeholder} className={styles.link}>
        {text.link}
      </a>
      {text.after}
    </p>
  );
}
