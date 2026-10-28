import type { DateTimeFormatOptions, NumberFormatOptions } from "next-intl";

export const formats = {
  dateTime: {
    weekdayTime: { weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    weekdayTimeLong: { weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  } satisfies Record<string, DateTimeFormatOptions>,
  number: {
    ils: { style: "currency", currency: "ILS", maximumFractionDigits: 0 },
    rating: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  } satisfies Record<string, NumberFormatOptions>,
} as const;

export type Formats = typeof formats;
