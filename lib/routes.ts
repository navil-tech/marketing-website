export const routes = {
  home: "/",
  shippers: "/",
  carriers: "/carriers",
  about: "/about",
  thanks: "/thanks",
  form: "#form",
  placeholder: "#",
} as const;

export const pageRoutes: readonly string[] = [routes.home, routes.carriers, routes.about, routes.thanks];

export const navOrder = ["shippers", "carriers", "about"] as const;

export type NavKey = (typeof navOrder)[number];

export const navRoutes: Record<NavKey, string> = {
  shippers: routes.shippers,
  carriers: routes.carriers,
  about: routes.about,
};
