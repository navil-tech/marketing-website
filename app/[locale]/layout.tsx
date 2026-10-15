import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import type { JSX } from "react";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { localeDirections, routing, type Locale } from "@/i18n/routing";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "cyrillic", "hebrew"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novil",
};

export function generateStaticParams(): { locale: Locale }[] {
  return routing.locales.map((locale: Locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">): Promise<JSX.Element> {
  const locale: Locale = await getLocale();
  return (
    <html lang={locale} dir={localeDirections[locale]} className={rubik.variable} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider attribute="data-theme">
            <Header />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
