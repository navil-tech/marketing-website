export type Theme = "light" | "dark";

export const themeStorageKey = "theme";

/** inline bootstrap: applies the stored theme (or the system one) before first paint */
export const themeBootstrapScript = `(function(){var m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var s=window.localStorage.getItem("${themeStorageKey}");document.documentElement.setAttribute("data-theme",s==="dark"||s==="light"?s:m);})();`;

export function readTheme(): Theme {
  const current: string | null = document.documentElement.getAttribute("data-theme");
  if (current === "dark" || current === "light") {
    return current;
  }
  throw new Error(`Unexpected data-theme value on <html>: ${String(current)}`);
}

export function writeTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(themeStorageKey, theme);
}
