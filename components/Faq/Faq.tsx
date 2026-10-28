"use client";

import { Plus } from "lucide-react";
import { useState, type JSX } from "react";
import styles from "./Faq.module.css";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  items: FaqItem[];
}

const closedIndex: number = -1;

export function Faq({ items }: FaqProps): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className={styles.list}>
      {items.map((item: FaqItem, index: number) => {
        const isOpen: boolean = openIndex === index;
        return (
          <div key={item.question} className={styles.item}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? closedIndex : index)}
              className={styles.question}
            >
              <span>{item.question}</span>
              <span className={`${styles.plus} ${isOpen ? styles.plusOpen : ""}`}>
                <Plus size={20} />
              </span>
            </button>
            {isOpen && <p className={styles.answer}>{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
