import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { getAllPublicProducts, type PublicProduct } from "@/lib/db/public-products";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatMAD } from "@/lib/format";
import { getLocale, getT } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/labels";
import { alternates } from "@/lib/i18n/seo";

// Every product and its price on one plain page: for a visitor comparing
// prices, and for assistants and crawlers (Meta's WhatsApp agent among them)
// that read one address rather than browsing aisle by aisle.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return { title: t.pricesPage.metaTitle, description: t.pricesPage.metaDescription, alternates: alternates(locale, "/prix") };
}

/** The price a customer pays: the cheapest unit in stock for a used phone. */
function priceOf(p: PublicProduct): { amount: number; from: boolean } {
  const units = p.variants.filter((v) => v.stockQuantity > 0 && v.priceOverride);
  const amounts = [...new Set(units.map((v) => Number(v.priceOverride!.toString())))];
  if (amounts.length) return { amount: Math.min(...amounts), from: amounts.length > 1 };
  return { amount: Number(p.recommendedSalePrice.toString()), from: false };
}

export default async function PricesPage() {
  const [products, t] = await Promise.all([getAllPublicProducts(), getT()]);
  const s = t.pricesPage;

  // Aisle by aisle, in the order the query returns them (phones first).
  const groups = new Map<string, { name: string; slug: string; items: PublicProduct[] }>();
  for (const p of products) {
    const g = groups.get(p.category.slug) ?? { name: categoryName(t, p.category.slug, p.category.name), slug: p.category.slug, items: [] };
    g.items.push(p);
    groups.set(p.category.slug, g);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8">
      <Breadcrumbs items={[{ name: t.common.home, path: "/" }, { name: s.title, path: "/prix" }]} />
      <h1 className="font-display mt-4 text-[2.4rem] font-extrabold leading-none text-ink sm:text-5xl">{s.title}</h1>
      <p className="mt-4 max-w-2xl text-neutral-600">{s.intro}</p>

      <nav aria-label={s.jump} className="mt-6 flex flex-wrap gap-2">
        {[...groups.values()].map((g) => (
          <a
            key={g.slug}
            href={`#${g.slug}`}
            className="inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
          >
            {g.name} <span className="readout ms-1.5 text-xs text-neutral-500">{g.items.length}</span>
          </a>
        ))}
      </nav>

      {[...groups.values()].map((g) => (
        <section key={g.slug} id={g.slug} aria-labelledby={`h-${g.slug}`} className="mt-10 scroll-mt-28">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={`h-${g.slug}`} className="font-display text-2xl font-bold text-ink">
              {g.name}
            </h2>
            <Link href={`/collections/${g.slug}`} className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
              {s.seeAisle}
            </Link>
          </div>
          <table className="mt-3 w-full overflow-hidden rounded-[1.25rem] bg-white text-sm ring-1 ring-ink/7">
            <thead className="bg-paper-2/60 text-start text-xs uppercase tracking-wider text-neutral-600">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-semibold">{s.product}</th>
                <th scope="col" className="hidden px-4 py-2.5 text-start font-semibold sm:table-cell">{s.condition}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-semibold">{s.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/7">
              {g.items.map((p) => {
                const { amount, from } = priceOf(p);
                const unavailable = p.availability !== "IN_STOCK";
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.slug}`} className="font-semibold text-ink hover:underline">
                        {p.name}
                      </Link>
                      <span className="block text-xs text-neutral-500 sm:hidden">{t.grades.label[p.condition] ?? p.condition}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">{t.grades.label[p.condition] ?? p.condition}</td>
                    <td className="px-4 py-3 text-end">
                      {unavailable ? (
                        <span className="text-xs font-semibold text-neutral-500">
                          {p.availability === "COMING_SOON" ? t.product.comingSoon : t.product.soldOut}
                        </span>
                      ) : (
                        <span className="readout font-bold text-ink">
                          {from && <span className="me-1 text-xs font-medium text-neutral-500">{t.product.fromPrice}</span>}
                          {formatMAD(amount)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
      <p className="mt-10 text-xs text-neutral-500">{s.footnote}</p>
    </div>
  );
}
