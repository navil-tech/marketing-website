"use client";

import type { JSX } from "react";
import { ButtonLink } from "@/components/Button/Button";
import { ArrowRightIcon, ArrowUpIcon } from "@/components/icons/Icons";
import type { Offer, ShippersDictionary, Step } from "@/lib/i18n/types";
import { routes } from "@/lib/routes";
import landing from "./landing.module.css";
import styles from "./HowSection.module.css";
import { useTick } from "./useTick";

interface HowSectionProps {
  dictionary: ShippersDictionary["how"];
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

function resolveStatus(dictionary: ShippersDictionary["how"]["demo"], state: DemoState): string {
  if (state.phase === 0) return dictionary.statusSearching;
  if (state.phase >= foundPhase) return dictionary.statusFound;
  return dictionary.statusResponding;
}

function resolveBarWidth(state: DemoState): string {
  if (state.phase >= foundPhase) return "100%";
  return `${Math.round((state.responses / maxResponses) * 85 + 10)}%`;
}

export function HowSection({ dictionary }: HowSectionProps): JSX.Element {
  const tick: number = useTick(tickIntervalMs);
  const state: DemoState = resolveDemoState(tick);
  const demo = dictionary.demo;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <h2 className={`${landing.sectionTitle} ${styles.title}`}>{dictionary.title}</h2>
          <p className={styles.subtitle}>{dictionary.subtitle}</p>
          {dictionary.steps.map((step: Step, index: number) => (
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
          <div className={`${styles.caption} ${styles.captionMobile}`}>{dictionary.caption}</div>
          <div className={styles.deviceMobile}>
            <PhoneScreen dictionary={demo} state={state} />
          </div>
          <ButtonLink href={routes.form} variant="primary" size="md" className={styles.cta}>
            {dictionary.cta}
            <ArrowUpIcon size={18} />
          </ButtonLink>
        </div>
        <div className={styles.deviceColumn}>
          <div className={styles.deviceDesktop}>
            <PhoneScreen dictionary={demo} state={state} />
          </div>
          <div className={`${styles.caption} ${styles.captionDesktop}`}>{dictionary.caption}</div>
        </div>
      </div>
    </section>
  );
}

interface PhoneScreenProps {
  dictionary: ShippersDictionary["how"]["demo"];
  state: DemoState;
}

function PhoneScreen({ dictionary, state }: PhoneScreenProps): JSX.Element {
  return (
    <div className={styles.device}>
      <div className={styles.screen}>
        <div className={styles.screenHead}>
          <span className={styles.screenTitle}>{dictionary.title}</span>
          <span className={styles.screenTime}>{dictionary.time}</span>
        </div>
        <div className={styles.order}>
          <div className={styles.orderCargo}>{dictionary.cargo}</div>
          <div className={styles.orderRoute}>
            <span>{dictionary.from}</span>
            <ArrowRightIcon size={14} />
            <span>{dictionary.to}</span>
          </div>
        </div>
        <div className={styles.status}>
          <span className={styles.statusText}>{resolveStatus(dictionary, state)}</span>
          <span className={styles.statusCount}>
            {state.responses} {dictionary.responseWords[state.responses]}
          </span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: resolveBarWidth(state) }} />
        </div>
        <div className={styles.offers}>
          {dictionary.offers.map((offer: Offer, index: number) => {
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
                  <span className={`${styles.tag} ${picked || fresh ? styles.tagVisible : ""} ${picked ? styles.tagPicked : ""}`}>
                    {picked ? dictionary.tagPicked : dictionary.tagNew}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.footnote}>{dictionary.footnote}</div>
      </div>
    </div>
  );
}
