import type { JSX, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "onAccent";

export type ButtonSize = "md" | "sm";

interface ButtonLinkProps {
  href: string;
  variant: ButtonVariant;
  size: ButtonSize;
  className: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant, size, className, children }: ButtonLinkProps): JSX.Element {
  return (
    <Link href={href} className={`${styles.button} ${styles[size]} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
