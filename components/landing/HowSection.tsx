"use client";

import { ArrowRight, ArrowUp } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
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

interface Offer {
  name: string;
  price: string;
  meta: string;
}

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
  const offers: Offer[] = useMessages().shippers.how.demo.offers;
  return (
    <div className={styles.device}>
      <div className={styles.screen}>
        <div className={styles.screenHead}>
          <span className={styles.screenTitle}>{t("how.demo.title")}</span>
          <span className={styles.screenTime}>{t("how.demo.time")}</span>
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
          {offers.map((offer: Offer, index: number) => {
            const shown: boolean = state.phase > index;
            const picked: boolean = state.phase >= foundPhase && index === 0;
            const fresh: boolean = state.phase < foundPhase && index === state.phase - 1;
            const dimmed: boolean = shown && state.phase >= foundPhase && index > 0;
            return (
              <div
                key={offer.name}
                className={`${styles.offer} ${shown ? styles.offerShown : ""} ${dimmed ? styles.offerDimmed : ""} ${picked ? styles.offerPicked : ""}`}
              >
                <div className={styles.offerHead}>
                  <span className={styles.offerName}>{offer.name}</span>
                  <span className={styles.offerPrice}>{offer.price}</span>
                </div>
                <div className={styles.offerMetaRow}>
                  <span className={styles.offerMeta}>{offer.meta}</span>
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
