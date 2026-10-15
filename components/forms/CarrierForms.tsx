"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import type { JSX, ReactNode } from "react";
import { submitCarrierApplication } from "@/app/actions";
import { Consent, ConsentLink } from "./Consent";
import { SelectField, TextField } from "./Field";
import styles from "./LeadForms.module.css";

export function CarrierCardForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("carriers");
  const regions: string[] = useMessages().carriers.form.regions;
  const action = submitCarrierApplication.bind(null, useLocale());
  return (
    <form id="form" action={action} className={styles.card}>
      <h2 className={styles.cardTitle}>{t("form.title")}</h2>
      <p className={styles.cardSubtitle}>{t("form.subtitle")}</p>
      <div className={styles.row}>
        <TextField
          id="c-name"
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
          id="c-email"
          name="email"
          label={fields("email")}
          hint=""
          type="email"
          autoComplete="email"
          placeholder={fields("emailPlaceholder")}
          required={true}
        />
      </div>
      <div className={`${styles.pair} ${styles.pairMid}`}>
        <TextField
          id="c-phone"
          name="phone"
          label={fields("phone")}
          hint={fields("phoneHint")}
          type="tel"
          autoComplete="tel"
          placeholder={fields("phonePlaceholder")}
          required={false}
        />
        <SelectField
          id="c-region"
          name="region"
          label={fields("region")}
          placeholder={fields("regionPlaceholder")}
          options={regions}
          required={true}
        />
      </div>
      <div className={styles.rowLast}>
        <TextField
          id="c-vehicle"
          name="vehicle"
          label={fields("vehicle")}
          hint=""
          type="text"
          autoComplete="off"
          placeholder={fields("vehiclePlaceholder")}
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

export function CarrierWideForm(): JSX.Element {
  const fields = useTranslations("fields");
  const t = useTranslations("carriers");
  const regions: string[] = useMessages().carriers.form.regions;
  const action = submitCarrierApplication.bind(null, useLocale());
  return (
    <form action={action} className={styles.wide}>
      <TextField
        id="m-c-name"
        name="name"
        label={fields("name")}
        hint=""
        type="text"
        autoComplete="name"
        placeholder=""
        required={true}
      />
      <TextField
        id="m-c-email"
        name="email"
        label={fields("email")}
        hint=""
        type="email"
        autoComplete="email"
        placeholder={fields("emailPlaceholder")}
        required={true}
      />
      <TextField
        id="m-c-phone"
        name="phone"
        label={fields("phone")}
        hint={fields("phoneHint")}
        type="tel"
        autoComplete="tel"
        placeholder={fields("phonePlaceholder")}
        required={false}
      />
      <SelectField
        id="m-c-region"
        name="region"
        label={fields("region")}
        placeholder={fields("regionPlaceholder")}
        options={regions}
        required={true}
      />
      <div className={styles.wideFull}>
        <TextField
          id="m-c-vehicle"
          name="vehicle"
          label={fields("vehicle")}
          hint=""
          type="text"
          autoComplete="off"
          placeholder={fields("vehiclePlaceholder")}
          required={true}
        />
      </div>
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
