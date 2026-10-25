import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { clipDescription, pageTitle } from "@/lib/seo-fit";

// The page itself runs in the browser, so its tab title is set here.
export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return {
    title: pageTitle(t.contact.metaTitle),
    description: clipDescription(t.contact.metaDescription),
    alternates: alternates(locale, "/contact"),
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
