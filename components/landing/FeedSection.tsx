"use client";

import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { ArrowUpIcon, StarIcon } from "@/components/icons/Icons";
import type { CarriersDictionary, Order } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import styles from "./FeedSection.module.css";
import { useTick } from "./useTick";

interface FeedSectionProps {
  feed: CarriersDictionary["feed"];
  price: CarriersDictionary["price"];
}

const tickIntervalMs: number = 1800;
const visibleOrders: number = 4;

function rotateOrders(orders: Order[], tick: number): Order[] {
  const shifts: number = Math.floor(tick / 2);
  const start: number = (orders.length - (shifts % orders.length)) % orders.length;
  return Array.from({ length: visibleOrders }, (_: unknown, index: number) => orders[(start + index) % orders.length]);
}

export function FeedSection({ feed, price }: FeedSectionProps): JSX.Element {
  const tick: number = useTick(tickIntervalMs);
  const orders: Order[] = rotateOrders(feed.orders, tick);
  const dotDim: boolean = tick % 2 === 1;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div>
          <h2 className={`${styles.title} ${styles.feedTitle}`}>{feed.title}</h2>
          <p className={styles.feedText}>{feed.text}</p>
          <div className={styles.feed}>
            <div className={styles.feedHead}>
              <span className={styles.feedLabel}>
                <span className={`${styles.dot} ${dotDim ? styles.dotDim : ""}`} />
                {feed.feedTitle}
              </span>
              <span className={styles.example}>{feed.example}</span>
            </div>
            <div className={styles.orders}>
              {orders.map((order: Order, index: number) => (
                <div key={order.route} className={`${styles.order} ${index === 0 ? styles.orderFirst : ""}`}>
                  <div className={styles.orderHead}>
                    <span className={styles.orderRoute}>{order.route}</span>
                    <span className={`${styles.badge} ${index === 0 ? styles.badgeVisible : ""}`}>
                      <span className={styles.badgeLong}>{feed.badge}</span>
                      <span className={styles.badgeShort}>{feed.badgeShort}</span>
                    </span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span>{order.what}</span>
                    <span className={styles.orderWhen}>{order.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.divider} />
        </div>
        <div>
          <h2 className={styles.title}>{price.title}</h2>
          <div className={styles.priceRow}>
            <span className={styles.amount}>{price.amount}</span>
            <span className={styles.now}>{price.now}</span>
          </div>
          <p className={styles.free}>{price.free}</p>
          <p className={styles.priceText}>{price.text}</p>
          <div className={styles.founder}>
            <span className={styles.founderBadge}>
              <StarIcon size={14} />
              {price.founderBadge}
            </span>
            <p className={styles.founderText}>{price.founderText}</p>
          </div>
          <ButtonLink href={routes.form} variant="onAccent" size="md" className={styles.cta}>
            {price.cta}
            <ArrowUpIcon size={18} />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
