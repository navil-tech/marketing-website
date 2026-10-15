import { Check } from "lucide-react";
import type { JSX } from "react";
import styles from "./Checklist.module.css";

interface ChecklistProps {
  items: string[];
  className: string;
}

export function Checklist({ items, className }: ChecklistProps): JSX.Element {
  return (
    <div className={`${styles.list} ${className}`}>
      {items.map((item: string) => (
        <div key={item} className={styles.item}>
          <span className={styles.icon}>
            <Check size={20} strokeWidth={2.4} />
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
