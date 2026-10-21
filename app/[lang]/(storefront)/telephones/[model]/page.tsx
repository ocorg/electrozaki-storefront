import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale, getT } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/config";
import { getModelPage } from "@/lib/offers/phone-offers";
import { MODEL_FACTS } from "@/lib/offers/models";
import { getReviewSummary } from "@/lib/reviews";
import { PhoneOfferPage, phoneOfferMetadata } from "../../offres/[slug]/PhoneOfferPage";

// A phone model's permanent page (/telephones/iphone-13): every unit in
// stock, promo or not, with the model's fiche, the technicians' check and
// the questions people ask. The page meant to be found in Google
// ("iPhone 13 d'occasion Meknès"); the promo pages point to it.
//
// Cached an hour; the ERP refreshes it at once whenever stock or prices change.
export const revalidate = 3600;

// Built on first visit, then served from the cache.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ model: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await params;
  const [page, locale] = await Promise.all([getModelPage(model), getLocale()]);
  return page ? phoneOfferMetadata(page, locale, "model") : {};
}

export default async function ModelPage({ params }: Props) {
  const { model } = await params;
  const [page, t, locale] = await Promise.all([getModelPage(model), getT(), getLocale()]);
  if (page) {
    const reviews = await getReviewSummary({ modelKey: page.modelKey });
    return <PhoneOfferPage offer={page} locale={locale} t={t} mode="model" reviews={reviews} />;
  }
  // A model we know but have none of right now: the phones aisle, searched
  // for it (temporary: stock comes back).
  const facts = MODEL_FACTS[model];
  if (facts) redirect(localePath(locale, `/collections/telephones?q=${encodeURIComponent(facts.name)}`));
  notFound();
}
