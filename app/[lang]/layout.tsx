import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, JetBrains_Mono, Manrope, Readex_Pro } from "next/font/google";
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
// Arabic: the Latin fonts above have no Arabic letters, so Arabic text falls
// back to these (globals.css lists them after the Latin ones: "iPhone 13"
// keeps the brand font inside an Arabic sentence). Not preloaded — only
// Arabic pages ever render those glyphs, and the browser fetches them then.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-plex-arabic",
  weight: ["400", "500", "600", "700"],
  preload: false,
});
const readex = Readex_Pro({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-readex",
  weight: ["500", "600", "700"],
  preload: false,
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
      className={`${manrope.variable} ${bricolage.variable} ${jetbrains.variable} ${plexArabic.variable} ${readex.variable}`}
    >
      <body className="bg-paper font-sans text-neutral-900">
        <I18nProvider locale={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
