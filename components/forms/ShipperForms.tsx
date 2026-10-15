"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import type { JSX, ReactNode } from "react";
import { submitShipperLead } from "@/app/actions";
import { Consent, ConsentLink } from "./Consent";
import { SelectField, TextField } from "./Field";
import styles from "./LeadForms.module.css";

export function ShipperCardForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("shippers");
  const regions: string[] = useMessages().shippers.form.regions;
  const action = submitShipperLead.bind(null, useLocale());
  return (
    <form id="form" action={action} className={styles.card}>
      <h2 className={styles.cardTitle}>{t("form.title")}</h2>
      <p className={styles.cardSubtitle}>{t("form.subtitle")}</p>
      <div className={styles.row}>
        <TextField
          id="s-name"
          name="name"
          label={fields("name")}
          hint=""
          type="text"
          autoComplete="name"
          placeholder=""
          required={true}
        />
      </div>
      <div className={styles.row}>
        <TextField
          id="s-email"
          name="email"
          label={fields("email")}
          hint=""
          type="email"
          autoComplete="email"
          placeholder={fields("emailPlaceholder")}
          required={true}
        />
      </div>
      <div className={styles.pair}>
        <TextField
          id="s-phone"
          name="phone"
          label={fields("phone")}
          hint={fields("phoneHint")}
          type="tel"
          autoComplete="tel"
          placeholder={fields("phonePlaceholder")}
          required={false}
        />
        <SelectField
          id="s-region"
          name="region"
          label={fields("region")}
          placeholder={fields("regionPlaceholder")}
          options={regions}
          required={true}
        />
      </div>
      <button type="submit" className={styles.submit}>
        {t("form.submit")}
      </button>
      <Consent
        className={styles.cardConsent}
        text={t.rich("form.consent", { link: (chunks: ReactNode) => <ConsentLink>{chunks}</ConsentLink> })}
      />
    </form>
  );
}

export function ShipperWideForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("shippers");
  const regions: string[] = useMessages().shippers.form.regions;
  const action = submitShipperLead.bind(null, useLocale());
  return (
    <form action={action} className={styles.wide}>
      <TextField
        id="m-s-name"
        name="name"
        label={fields("name")}
        hint=""
        type="text"
        autoComplete="name"
        placeholder=""
        required={true}
      />
      <TextField
        id="m-s-email"
        name="email"
        label={fields("email")}
        hint=""
        type="email"
        autoComplete="email"
        placeholder={fields("emailPlaceholder")}
        required={true}
      />
      <TextField
        id="m-s-phone"
        name="phone"
        label={fields("phone")}
        hint={fields("phoneHint")}
        type="tel"
        autoComplete="tel"
        placeholder={fields("phonePlaceholder")}
        required={false}
      />
      <SelectField
        id="m-s-region"
        name="region"
        label={fields("region")}
        placeholder={fields("regionPlaceholder")}
        options={regions}
        required={true}
      />
      <button type="submit" className={`${styles.submit} ${styles.wideSubmit}`}>
        {t("leadCard.submit")}
      </button>
      <Consent
        className={styles.wideConsent}
        text={t.rich("leadCard.consent", { link: (chunks: ReactNode) => <ConsentLink>{chunks}</ConsentLink> })}
      />
    </form>
  );
}
