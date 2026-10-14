import { ru } from "./ru";
import type { Dictionary, Locale, TextDirection } from "./types";

export const currentLocale: Locale = "ru";

const directions: Record<Locale, TextDirection> = {
  ru: "ltr",
  en: "ltr",
  he: "rtl",
};

const dictionaries: Partial<Record<Locale, Dictionary>> = {
  ru,
};

export function getDictionary(locale: Locale): Dictionary {
  const dictionary: Dictionary | undefined = dictionaries[locale];
  if (dictionary === undefined) {
    throw new Error(`Dictionary for locale "${locale}" is not available yet`);
  }
  return dictionary;
}

export function getDirection(locale: Locale): TextDirection {
  return directions[locale];
}
