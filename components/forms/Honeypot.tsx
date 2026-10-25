import type { JSX } from "react";
import styles from "./Honeypot.module.css";

export const HONEYPOT_FIELD = "website";

export function Honeypot(): JSX.Element {
  return (
    <input
      type="text"
      name={HONEYPOT_FIELD}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className={styles.honeypot}
    />
  );
}
