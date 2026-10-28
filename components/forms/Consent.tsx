import type { JSX, ReactNode } from "react";
import { routes } from "@/lib/routes";
import styles from "./Consent.module.css";

interface ConsentProps {
  id: string;
  text: ReactNode;
  className: string;
}

interface ConsentLinkProps {
  children: ReactNode;
}

export function Consent({ id, text, className }: ConsentProps): JSX.Element {
  return (
    <label htmlFor={id} className={`${styles.consent} ${className}`}>
      <input id={id} name="consent" type="checkbox" required={true} className={styles.checkbox} />
      <span>{text}</span>
    </label>
  );
}

export function ConsentLink({ children }: ConsentLinkProps): JSX.Element {
  return (
    <a href={routes.placeholder} className={styles.link}>
      {children}
    </a>
  );
}
