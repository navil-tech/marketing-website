"use client";

import type { JSX } from "react";
import { submitShipperLead } from "@/app/actions";
import type { FieldsDictionary, LeadCardDictionary, LeadFormDictionary } from "@/lib/i18n/types";
import { Consent } from "./Consent";
import { SelectField, TextField } from "./Field";
import styles from "./LeadForms.module.css";

interface ShipperCardFormProps {
  fields: FieldsDictionary;
  form: LeadFormDictionary;
}

interface ShipperWideFormProps {
  fields: FieldsDictionary;
  form: LeadFormDictionary;
  card: LeadCardDictionary;
}

export function ShipperCardForm({ fields, form }: ShipperCardFormProps): JSX.Element {
  return (
    <form id="form" action={submitShipperLead} className={styles.card}>
      <h2 className={styles.cardTitle}>{form.title}</h2>
      <p className={styles.cardSubtitle}>{form.subtitle}</p>
      <div className={styles.row}>
        <TextField id="s-name" name="name" label={fields.name} hint="" type="text" autoComplete="name" placeholder="" required={true} />
      </div>
      <div className={styles.row}>
        <TextField id="s-email" name="email" label={fields.email} hint="" type="email" autoComplete="email" placeholder={fields.emailPlaceholder} required={true} />
      </div>
      <div className={styles.pair}>
        <TextField id="s-phone" name="phone" label={fields.phone} hint={fields.phoneHint} type="tel" autoComplete="tel" placeholder={fields.phonePlaceholder} required={false} />
        <SelectField id="s-region" name="region" label={fields.region} placeholder={fields.regionPlaceholder} options={form.regions} required={true} />
      </div>
      <button type="submit" className={styles.submit}>
        {form.submit}
      </button>
      <Consent text={form.consent} className={styles.cardConsent} />
    </form>
  );
}

export function ShipperWideForm({ fields, form, card }: ShipperWideFormProps): JSX.Element {
  return (
    <form action={submitShipperLead} className={styles.wide}>
      <TextField id="m-s-name" name="name" label={fields.name} hint="" type="text" autoComplete="name" placeholder="" required={true} />
      <TextField id="m-s-email" name="email" label={fields.email} hint="" type="email" autoComplete="email" placeholder={fields.emailPlaceholder} required={true} />
      <TextField id="m-s-phone" name="phone" label={fields.phone} hint={fields.phoneHint} type="tel" autoComplete="tel" placeholder={fields.phonePlaceholder} required={false} />
      <SelectField id="m-s-region" name="region" label={fields.region} placeholder={fields.regionPlaceholder} options={form.regions} required={true} />
      <button type="submit" className={`${styles.submit} ${styles.wideSubmit}`}>
        {card.submit}
      </button>
      <Consent text={card.consent} className={styles.wideConsent} />
    </form>
  );
}
