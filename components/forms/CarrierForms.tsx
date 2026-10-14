"use client";

import type { JSX } from "react";
import { submitCarrierApplication } from "@/app/actions";
import type { FieldsDictionary, LeadCardDictionary, LeadFormDictionary } from "@/lib/i18n/types";
import { Consent } from "./Consent";
import { SelectField, TextField } from "./Field";
import styles from "./LeadForms.module.css";

interface CarrierCardFormProps {
  fields: FieldsDictionary;
  form: LeadFormDictionary;
}

interface CarrierWideFormProps {
  fields: FieldsDictionary;
  form: LeadFormDictionary;
  card: LeadCardDictionary;
}

export function CarrierCardForm({ fields, form }: CarrierCardFormProps): JSX.Element {
  return (
    <form id="form" action={submitCarrierApplication} className={styles.card}>
      <h2 className={styles.cardTitle}>{form.title}</h2>
      <p className={styles.cardSubtitle}>{form.subtitle}</p>
      <div className={styles.row}>
        <TextField id="c-name" name="name" label={fields.name} hint="" type="text" autoComplete="name" placeholder="" required={true} />
      </div>
      <div className={styles.row}>
        <TextField id="c-email" name="email" label={fields.email} hint="" type="email" autoComplete="email" placeholder={fields.emailPlaceholder} required={true} />
      </div>
      <div className={`${styles.pair} ${styles.pairMid}`}>
        <TextField id="c-phone" name="phone" label={fields.phone} hint={fields.phoneHint} type="tel" autoComplete="tel" placeholder={fields.phonePlaceholder} required={false} />
        <SelectField id="c-region" name="region" label={fields.region} placeholder={fields.regionPlaceholder} options={form.regions} required={true} />
      </div>
      <div className={styles.rowLast}>
        <TextField id="c-vehicle" name="vehicle" label={fields.vehicle} hint="" type="text" autoComplete="off" placeholder={fields.vehiclePlaceholder} required={true} />
      </div>
      <button type="submit" className={styles.submit}>
        {form.submit}
      </button>
      <Consent text={form.consent} className={styles.cardConsent} />
    </form>
  );
}

export function CarrierWideForm({ fields, form, card }: CarrierWideFormProps): JSX.Element {
  return (
    <form action={submitCarrierApplication} className={styles.wide}>
      <TextField id="m-c-name" name="name" label={fields.name} hint="" type="text" autoComplete="name" placeholder="" required={true} />
      <TextField id="m-c-email" name="email" label={fields.email} hint="" type="email" autoComplete="email" placeholder={fields.emailPlaceholder} required={true} />
      <TextField id="m-c-phone" name="phone" label={fields.phone} hint={fields.phoneHint} type="tel" autoComplete="tel" placeholder={fields.phonePlaceholder} required={false} />
      <SelectField id="m-c-region" name="region" label={fields.region} placeholder={fields.regionPlaceholder} options={form.regions} required={true} />
      <div className={styles.wideFull}>
        <TextField id="m-c-vehicle" name="vehicle" label={fields.vehicle} hint="" type="text" autoComplete="off" placeholder={fields.vehiclePlaceholder} required={true} />
      </div>
      <button type="submit" className={`${styles.submit} ${styles.wideSubmit}`}>
        {card.submit}
      </button>
      <Consent text={card.consent} className={styles.wideConsent} />
    </form>
  );
}
