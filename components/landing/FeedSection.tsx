"use client";

import { ArrowUp, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { routes } from "@/lib/routes";
import styles from "./FeedSection.module.css";
import { useTick } from "./useTick";

type OrderKey = "sofa" | "office" | "fridge" | "move" | "boxes" | "washer";

interface Order {
  key: OrderKey;
  at: Date;
}

// fictional demo data; texts come from messages, dates are formatted per locale
const demoOrders: Order[] = [
  { key: "sofa", at: new Date("2026-10-15T09:00:00+03:00") },
  { key: "office", at: new Date("2026-10-16T14:00:00+03:00") },
  { key: "fridge", at: new Date("2026-10-14T18:00:00+03:00") },
  { key: "move", at: new Date("2026-10-18T10:00:00+03:00") },
  { key: "boxes", at: new Date("2026-10-14T20:00:00+03:00") },
  { key: "washer", at: new Date("2026-10-15T12:00:00+03:00") },
];
const pilotPriceIls: number = 0;

const tickIntervalMs: number = 1800;
const visibleOrders: number = 4;

function rotateOrders(orders: Order[], tick: number): Order[] {
  const shifts: number = Math.floor(tick / 2);
  const start: number = (orders.length - (shifts % orders.length)) % orders.length;
  return Array.from({ length: visibleOrders }, (_: unknown, index: number) => orders[(start + index) % orders.length]);
}

export function FeedSection(): JSX.Element {
  const t = useTranslations("carriers");
  const format = useFormatter();
  const tick: number = useTick(tickIntervalMs);
  const orders: Order[] = rotateOrders(demoOrders, tick);
  const dotDim: boolean = tick % 2 === 1;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div>
          <h2 className={`${styles.title} ${styles.feedTitle}`}>{t("feed.title")}</h2>
          <p className={styles.feedText}>{t("feed.text")}</p>
          <div className={styles.feed}>
            <div className={styles.feedHead}>
              <span className={styles.feedLabel}>
                <span className={`${styles.dot} ${dotDim ? styles.dotDim : ""}`} />
                {t("feed.feedTitle")}
              </span>
              <span className={styles.example}>{t("feed.example")}</span>
            </div>
            <div className={styles.orders}>
              {orders.map((order: Order, index: number) => (
                <div key={order.key} className={`${styles.order} ${index === 0 ? styles.orderFirst : ""}`}>
                  <div className={styles.orderHead}>
                    <span className={styles.orderRoute}>{t(`feed.orders.${order.key}.route`)}</span>
                    <span className={`${styles.badge} ${index === 0 ? styles.badgeVisible : ""}`}>
                      <span className={styles.badgeLong}>{t("feed.badge")}</span>
                      <span className={styles.badgeShort}>{t("feed.badgeShort")}</span>
                    </span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span>{t(`feed.orders.${order.key}.what`)}</span>
                    <span className={styles.orderWhen}>{format.dateTime(order.at, "weekdayTime")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.divider} />
        </div>
        <div>
          <h2 className={styles.title}>{t("price.title")}</h2>
          <div className={styles.priceRow}>
            <span className={styles.amount}>{format.number(pilotPriceIls, "ils")}</span>
            <span className={styles.now}>{t("price.now")}</span>
          </div>
          <p className={styles.free}>{t("price.free")}</p>
          <p className={styles.priceText}>{t("price.text")}</p>
          <div className={styles.founder}>
            <span className={styles.founderBadge}>
              <Star size={14} fill="currentColor" />
              {t("price.founderBadge")}
            </span>
            <p className={styles.founderText}>{t("price.founderText")}</p>
          </div>
          <ButtonLink href={routes.form} variant="onAccent" size="md" className={styles.cta}>
            {t("price.cta")}
            <ArrowUp size={18} strokeWidth={2.2} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
