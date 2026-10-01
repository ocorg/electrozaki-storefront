import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { SHOP, SITE_URL } from "@/lib/site";
import { isLocale, LOCALE_META, LOCALES } from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import "../globals.css";

// Manrope: the brand's body font from the Shopify theme (kept).
// Bricolage Grotesque: display — a grotesque with ink-trap character that
// reads "made here", not "template". JetBrains Mono: prices, battery %,
// storage — the device-readout voice. All self-hosted by next/font (no
// request to Google at runtime) and exposed as CSS variables that
// app/globals.css maps to font-sans / font-display / font-mono.
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["500", "700", "800"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "600", "700"],
});
// Arabic: Alexandria (SIL Open Font License), a modern geometric Arabic face
// that sits well next to Bricolage and Manrope. On Arabic pages globals.css
// puts it FIRST in every font stack: the Latin fonts' generated fallbacks
// (local Arial) cover Arabic letters too, so listed after them it would never
// be reached. Self-hosted as its Arabic-only file, limited to the Arabic
// blocks, so Latin words ("iPhone 13") still use the brand fonts; the Google
// loader would also bring Alexandria's Latin files, which would take over
// those words. One variable file covers every weight. Not preloaded: only
// Arabic pages ever render these glyphs.
const alexandria = localFont({
  src: "../fonts/alexandria-arabic.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-arabic",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC",
    },
  ],
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = DICTIONARIES[lang];
  return {
    metadataBase: new URL(SITE_URL),
    // Every page's tab reads "Page | Electro Zaki" (pages give only their own name).
    title: { default: t.meta.title, template: `%s | ${SHOP.name}` },
    description: t.meta.description,
    applicationName: SHOP.name,
    openGraph: {
      type: "website",
      locale: LOCALE_META[lang].ogLocale,
      siteName: SHOP.name,
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#111013",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const meta = LOCALE_META[lang];

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`${manrope.variable} ${bricolage.variable} ${jetbrains.variable} ${alexandria.variable}`}
    >
      <body className="bg-paper font-sans text-neutral-900">
        <I18nProvider locale={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
