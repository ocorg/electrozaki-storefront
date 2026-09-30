import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getProductsByCategorySlug, getCategoryFilterOptions } from "@/lib/db/public-products";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getAisles } from "@/lib/db/storefront";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogBar, type FilterValues } from "@/components/storefront/CatalogBar";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { Pagination } from "@/components/storefront/Pagination";
import { SearchTracker } from "@/components/analytics/SearchTracker";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnchorButton } from "@/components/ui/Button";
import { AISLE_BLURB, artFor } from "@/lib/category-art";
import { formatMAD } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

// A 60s cache keeps pages fast; the ERP also asks for an immediate refresh
// (/api/revalidate) whenever stock or presentation changes.
export const revalidate = 60;

const PER_PAGE = 24;

// Next.js 16: both params and searchParams are Promises now.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<FilterValues>;
};

function introFor(slug: string, name: string, isPhones: boolean): string {
  if (isPhones) {
    return "iPhone, Samsung, Xiaomi, Honor… neufs et d'occasion. Chaque téléphone d'occasion est vendu à l'unité, avec son état, sa batterie et ses pièces affichés.";
  }
  const blurb = AISLE_BLURB[slug];
  return `${blurb ? `${blurb}. ` : ""}${name} en stock à Meknès, livraison partout au Maroc.`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Filtered views point to the aisle itself; later pages keep their own
  // URL so products past page 1 stay discoverable.
  const pageNo = Number((await searchParams).page);
  const canonical = `/collections/${slug}${Number.isInteger(pageNo) && pageNo > 1 ? `?page=${pageNo}` : ""}`;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const isPhones = slug === "telephones";
  const title = isPhones ? "Téléphones neufs et d'occasion à Meknès" : `${category.name} — accessoires téléphone à Meknès`;
  const description = isPhones
    ? "iPhone, Samsung, Xiaomi neufs et d'occasion à Meknès : état, batterie et pièces affichés pour chaque téléphone. Livraison partout au Maroc."
    : `${category.name} pour téléphone chez Electro Zaki, Meknès. ${AISLE_BLURB[slug] ?? "En stock"} — livraison partout au Maroc.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | Electro Zaki`, description, url: canonical },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filterParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [options, aisles] = await Promise.all([getCategoryFilterOptions(slug), getAisles()]);
  const phones = options.kind === "phones";
  const str = (v?: string) => (typeof v === "string" && v ? v.slice(0, 80) : undefined);
  const int = (v?: string) => (v && Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined);

  // Only the filters that belong to this kind of category are applied.
  const filters = {
    brand: str(filterParams.brand),
    q: str(filterParams.q),
    promo: filterParams.promo === "1" || undefined,
    maxPrice: int(filterParams.maxPrice),
    condition: phones ? str(filterParams.condition) : undefined,
    minBatteryHealth: phones ? int(filterParams.minBattery) : undefined,
    storage: phones ? str(filterParams.storage) : undefined,
    subcategory: phones ? undefined : str(filterParams.type),
    compatibleWith: phones ? undefined : str(filterParams.fits),
  };

  const all = await getProductsByCategorySlug(slug, filters);

  // Sorting and paging happen here: a whole aisle is at most a few hundred
  // rows, already fetched in one query for the filters above.
  const price = (p: (typeof all)[number]) => Number(p.recommendedSalePrice.toString());
  const sorted =
    filterParams.sort === "prix-asc"
      ? [...all].sort((a, b) => price(a) - price(b))
      : filterParams.sort === "prix-desc"
        ? [...all].sort((a, b) => price(b) - price(a))
        : all;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pageCount, int(filterParams.page) ?? 1);
  const products = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Aisle chips: the children of a parent aisle, or a leaf's siblings.
  const groupSlug = category.parent?.slug ?? slug;
  const siblings = aisles.filter((a) => a.parentSlug === groupSlug);
  const current = aisles.find((a) => a.slug === slug);
  // How much stock there is stays private; what it costs is the useful part.
  const prices = (current ? [current] : siblings).map((a) => a.fromPrice).filter((p): p is number => p !== null);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const filtered = Object.values(filters).some(Boolean);

  const crumbs = [
    { name: "Accueil", path: "/" },
    ...(category.parent ? [{ name: category.parent.name, path: `/collections/${category.parent.slug}` }] : []),
    { name: category.name, path: `/collections/${slug}` },
  ];

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper-2/60">
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 pb-8 pt-8 sm:pt-10 md:grid-cols-[1fr_auto]">
          <div>
            <Breadcrumbs items={crumbs} />
            <h1 className="font-display mt-4 text-[2.4rem] font-extrabold leading-none text-ink sm:text-6xl">{category.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {introFor(slug, category.name, phones)}
            </p>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <DeviceArt kind={artFor(slug, category.name)} className="h-28 w-28 text-ink" />
            {fromPrice !== null && (
              <p className="text-right">
                <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                  À partir de
                </span>
                <span className="readout mt-1 block text-5xl font-bold text-ink">{formatMAD(fromPrice)}</span>
              </p>
            )}
          </div>
        </div>

        {siblings.length > 1 && (
          <div className="mx-auto max-w-7xl px-4 pb-6">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none" aria-label="Rayons">
              {category.parent && (
                <li className="flex-none">
                  <Link
                    href={`/collections/${category.parent.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                  >
                    Tout voir
                  </Link>
                </li>
              )}
              {siblings.map((a) => {
                const on = a.slug === slug;
                return (
                  <li key={a.slug} className="flex-none">
                    <Link
                      href={`/collections/${a.slug}`}
                      aria-current={on ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full pl-1.5 pr-4 text-sm font-semibold transition-colors ${
                        on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-white/10" : "bg-paper"}`}>
                        <DeviceArt kind={artFor(a.slug, a.name)} className={`h-6 w-6 ${on ? "text-white" : "text-ink"}`} />
                      </span>
                      {a.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:pb-10">
        {filters.q && <SearchTracker query={filters.q} results={all.length} />}

        <CatalogBar options={options} basePath={`/collections/${slug}`} defaults={filterParams} />

        <div className="pt-6 sm:pt-8">
          <div>
            {pageCount > 1 && (
              <p className="sr-only" aria-live="polite">
                Page {page} sur {pageCount}
              </p>
            )}
            {products.length === 0 ? (
              <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
                <DeviceArt kind={artFor(slug, category.name)} className="h-24 w-24 text-neutral-400" />
                <p className="font-display mt-4 text-2xl font-bold text-ink">
                  {filtered ? "Rien pour ces filtres." : "Nouveaux articles bientôt en ligne."}
                </p>
                <p className="mt-2 max-w-md text-neutral-600">
                  {filtered
                    ? "Élargissez la recherche, ou demandez-nous : le stock en boutique bouge tous les jours."
                    : "Contactez-nous sur WhatsApp pour connaître le stock en magasin."}
                </p>
                <AnchorButton
                  href={whatsappLink(`Bonjour, je cherche : ${category.name}${filters.q ? ` (${filters.q})` : ""}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  className="mt-6"
                >
                  <MessageCircle size={18} aria-hidden /> Demander sur WhatsApp
                </AnchorButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}
            <Pagination
              page={page}
              pageCount={pageCount}
              basePath={`/collections/${slug}`}
              params={filterParams as Record<string, string | undefined>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
