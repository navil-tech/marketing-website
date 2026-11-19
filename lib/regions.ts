import { Region } from "@/lib/generated/prisma/enums";

// shippers pick a single area; carriers can also cover the whole country
export const SHIPPER_REGIONS = [
  Region.TEL_AVIV,
  Region.RAMAT_GAN_GIVATAYIM,
  Region.BAT_YAM_HOLON,
  Region.PETAH_TIKVA,
  Region.RISHON_LEZION,
  Region.HERZLIYA_RAANANA,
  Region.BNEI_BRAK,
  Region.OTHER,
] as const satisfies readonly Region[];

export const CARRIER_REGIONS = [
  Region.TEL_AVIV,
  Region.RAMAT_GAN_GIVATAYIM,
  Region.BAT_YAM_HOLON,
  Region.PETAH_TIKVA,
  Region.RISHON_LEZION,
  Region.HERZLIYA_RAANANA,
  Region.BNEI_BRAK,
  Region.WHOLE_COUNTRY,
  Region.OTHER,
] as const satisfies readonly Region[];
