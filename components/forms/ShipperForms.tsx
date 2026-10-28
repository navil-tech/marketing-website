"use client";

import { useLocale, useTranslations } from "next-intl";
import type { JSX, ReactNode } from "react";
import { submitShipperLead } from "@/app/actions";
import { Consent, ConsentLink } from "./Consent";
import { SHIPPER_REGIONS } from "@/lib/regions";
import { SelectField, type SelectOption, TextField } from "./Field";
import { Honeypot } from "./Honeypot";
import styles from "./LeadForms.module.css";

export function ShipperCardForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("shippers");
  const regions: SelectOption[] = SHIPPER_REGIONS.map((region) => ({
    value: region,
    label: fields(`regions.${region}`),
  }));
  const action = submitShipperLead.bind(null, useLocale());
  return (
    <form id="form" action={action} className={styles.card}>
      <Honeypot />
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
        id="s-consent"
        className={styles.cardConsent}
        text={t.rich("form.consent", { link: (chunks: ReactNode) => <ConsentLink>{chunks}</ConsentLink> })}
      />
    </form>
  );
}

export function ShipperWideForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("shippers");
  const regions: SelectOption[] = SHIPPER_REGIONS.map((region) => ({
    value: region,
    label: fields(`regions.${region}`),
  }));
  const action = submitShipperLead.bind(null, useLocale());
  return (
    <form action={action} className={styles.wide}>
      <Honeypot />
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
        id="m-s-consent"
        className={styles.wideConsent}
        text={t.rich("leadCard.consent", { link: (chunks: ReactNode) => <ConsentLink>{chunks}</ConsentLink> })}
      />
    </form>
  );
}
