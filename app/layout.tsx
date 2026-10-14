import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import type { JSX } from "react";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { currentLocale, getDictionary, getDirection } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";
import { themeBootstrapScript } from "@/lib/theme";
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

export default function RootLayout({ children }: LayoutProps<"/">): JSX.Element {
  const dictionary: Dictionary = getDictionary(currentLocale);
  return (
    <html lang={currentLocale} dir={getDirection(currentLocale)} className={rubik.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <Header dictionary={dictionary.header} locale={currentLocale} />
        <main>{children}</main>
        <Footer dictionary={dictionary.footer} nav={dictionary.header.nav} />
      </body>
    </html>
  );
}
