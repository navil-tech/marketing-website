import type { NavKey } from "./i18n/types";

export const routes = {
  home: "/",
  shippers: "/",
  carriers: "/carriers",
  about: "/about",
  thanks: "/thanks",
  form: "#form",
  placeholder: "#",
} as const;

export const navOrder: NavKey[] = ["shippers", "carriers", "about"];

export const navRoutes: Record<NavKey, string> = {
  shippers: routes.shippers,
  carriers: routes.carriers,
  about: routes.about,
};
