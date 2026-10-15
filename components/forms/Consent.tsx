import type { JSX, ReactNode } from "react";
import { routes } from "@/lib/routes";
import styles from "./Consent.module.css";

interface ConsentProps {
  text: ReactNode;
  className: string;
}

interface ConsentLinkProps {
  children: ReactNode;
}

export function Consent({ text, className }: ConsentProps): JSX.Element {
  return <p className={`${styles.consent} ${className}`}>{text}</p>;
}

/** renders the `<link>` tag of a consent message */
export function ConsentLink({ children }: ConsentLinkProps): JSX.Element {
  return (
    <a href={routes.placeholder} className={styles.link}>
      {children}
    </a>
  );
}
