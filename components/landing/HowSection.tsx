"use client";

import { ArrowRight, ArrowUp } from "lucide-react";
import { useFormatter, useMessages, useTranslations } from "next-intl";
import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { routes } from "@/lib/routes";
import landing from "./landing.module.css";
import styles from "./HowSection.module.css";
import { useTick } from "./useTick";

interface Step {
  title: string;
  text: string;
}

type OfferKey = "van" | "truck" | "lift";

interface Offer {
  key: OfferKey;
  priceIls: number;
  rating: number;
  reviews: number;
}

// fictional demo data; names come from messages, numbers are formatted per locale
const demoOffers: Offer[] = [
  { key: "van", priceIls: 450, rating: 4.9, reviews: 38 },
  { key: "truck", priceIls: 520, rating: 4.8, reviews: 21 },
  { key: "lift", priceIls: 610, rating: 5, reviews: 54 },
];
const demoTime: Date = new Date("2026-10-16T10:00:00+03:00");

const tickIntervalMs: number = 1800;
const phaseCount: number = 6;
const foundPhase: number = 4;
const maxResponses: number = 3;

interface DemoState {
  phase: number;
  responses: number;
  stage: number;
}

function resolveDemoState(tick: number): DemoState {
  const phase: number = tick % phaseCount;
  const responses: number = Math.min(phase, maxResponses);
  const stage: number = phase === 0 ? 0 : phase >= foundPhase ? 2 : 1;
  return { phase, responses, stage };
}

function resolveStatusKey(state: DemoState): "statusSearching" | "statusFound" | "statusResponding" {
  if (state.phase === 0) return "statusSearching";
  if (state.phase >= foundPhase) return "statusFound";
  return "statusResponding";
}

function resolveBarWidth(state: DemoState): string {
  if (state.phase >= foundPhase) return "100%";
  return `${Math.round((state.responses / maxResponses) * 85 + 10)}%`;
}

export function HowSection(): JSX.Element {
  const t = useTranslations("shippers");
  const steps: Step[] = useMessages().shippers.how.steps;
  const tick: number = useTick(tickIntervalMs);
  const state: DemoState = resolveDemoState(tick);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <h2 className={`${landing.sectionTitle} ${styles.title}`}>{t("how.title")}</h2>
          <p className={styles.subtitle}>{t("how.subtitle")}</p>
          {steps.map((step: Step, index: number) => (
            <div key={step.title} className={styles.step}>
              <div className={`${styles.stepNumber} ${state.stage === index ? styles.stepNumberActive : ""}`}>
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </div>
          ))}
          <div className={`${styles.caption} ${styles.captionMobile}`}>{t("how.caption")}</div>
          <div className={styles.deviceMobile}>
            <PhoneScreen state={state} />
          </div>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.cta}>
            {t("how.cta")}
            <ArrowUp size={18} strokeWidth={2.2} />
          </ButtonLink>
        </div>
        <div className={styles.deviceColumn}>
          <div className={styles.deviceDesktop}>
            <PhoneScreen state={state} />
          </div>
          <div className={`${styles.caption} ${styles.captionDesktop}`}>{t("how.caption")}</div>
        </div>
      </div>
    </section>
  );
}

interface PhoneScreenProps {
  state: DemoState;
}

function PhoneScreen({ state }: PhoneScreenProps): JSX.Element {
  const t = useTranslations("shippers");
  const format = useFormatter();
  return (
    <div className={styles.device}>
      <div className={styles.screen}>
        <div className={styles.screenHead}>
          <span className={styles.screenTitle}>{t("how.demo.title")}</span>
          <span className={styles.screenTime}>{format.dateTime(demoTime, "weekdayTimeLong")}</span>
        </div>
        <div className={styles.order}>
          <div className={styles.orderCargo}>{t("how.demo.cargo")}</div>
          <div className={styles.orderRoute}>
            <span>{t("how.demo.from")}</span>
            <ArrowRight size={14} />
            <span>{t("how.demo.to")}</span>
          </div>
        </div>
        <div className={styles.status}>
          <span className={styles.statusText}>{t(`how.demo.${resolveStatusKey(state)}`)}</span>
          <span className={styles.statusCount}>{t("how.demo.responses", { count: state.responses })}</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: resolveBarWidth(state) }} />
        </div>
        <div className={styles.offers}>
          {demoOffers.map((offer: Offer, index: number) => {
            const shown: boolean = state.phase > index;
            const picked: boolean = state.phase >= foundPhase && index === 0;
            const fresh: boolean = state.phase < foundPhase && index === state.phase - 1;
            const dimmed: boolean = shown && state.phase >= foundPhase && index > 0;
            return (
              <div
                key={offer.key}
                className={`${styles.offer} ${shown ? styles.offerShown : ""} ${dimmed ? styles.offerDimmed : ""} ${picked ? styles.offerPicked : ""}`}
              >
                <div className={styles.offerHead}>
                  <span className={styles.offerName}>{t(`how.demo.offers.${offer.key}`)}</span>
                  <span className={styles.offerPrice}>{format.number(offer.priceIls, "ils")}</span>
                </div>
                <div className={styles.offerMetaRow}>
                  <span className={styles.offerMeta}>
                    {t("how.demo.offerMeta", {
                      rating: format.number(offer.rating, "rating"),
                      reviews: offer.reviews,
                    })}
                  </span>
                  <span
                    className={`${styles.tag} ${picked || fresh ? styles.tagVisible : ""} ${picked ? styles.tagPicked : ""}`}
                  >
                    {picked ? t("how.demo.tagPicked") : t("how.demo.tagNew")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.footnote}>{t("how.demo.footnote")}</div>
      </div>
    </div>
  );
}
