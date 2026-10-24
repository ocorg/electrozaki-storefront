import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import Link from "@/components/i18n/Link";
import { getProductsByCategorySlug, getCategoryFilterOptions, countShopOnlyAccessories, shorterQueries } from "@/lib/db/public-products";
import { NoExactMatch } from "@/components/storefront/NoExactMatch";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getAisles } from "@/lib/db/storefront";
import { getFacetGroups } from "@/lib/db/facets";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogBar, type FilterValues } from "@/components/storefront/CatalogBar";
import { AisleGuide, type GuideStep } from "@/components/storefront/AisleGuide";
import { RememberedPhone } from "@/components/storefront/RememberedPhone";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { Pagination } from "@/components/storefront/Pagination";
import { SearchTracker } from "@/components/analytics/SearchTracker";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { getModelPages } from "@/lib/offers/phone-offers";
import { artFor } from "@/lib/category-art";
import { formatMAD } from "@/lib/format";
import { aisleOpen, whatsappLink } from "@/lib/site";
import { ComingSoon } from "@/components/storefront/ComingSoon";
import { getLocale, getT } from "@/lib/i18n/server";
import { categoryName, facetOptionName, facetQuestion } from "@/lib/i18n/labels";
import { BUDGET_BANDS, MODEL_GROUP, budgetOf, hasOption, matchesSelection, optionsIn, readBudget, readSelection } from "@/lib/facets";
import { alternates } from "@/lib/i18n/seo";

// An hour's cache keeps pages fast and cheap; the ERP asks for an immediate refresh
// (/api/revalidate) whenever stock or presentation changes.
export const revalidate = 3600;

const PER_PAGE = 24;

// The grades a phone can have (anything else in ?condition= is ignored).
const GRADES = new Set(["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"]);

// Next.js 16: both params and searchParams are Promises now.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<FilterValues>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Filtered views point to the aisle itself; later pages keep their own
  // URL so products past page 1 stay discoverable.
  const pageNo = Number((await searchParams).page);
  const path = `/collections/${slug}${Number.isInteger(pageNo) && pageNo > 1 ? `?page=${pageNo}` : ""}`;
  const [category, t, locale] = await Promise.all([getCategoryBySlug(slug), getT(), getLocale()]);
  if (!category) return {};
  const name = categoryName(t, slug, category.name);
  if (!aisleOpen(slug, category.parent?.slug)) return { title: t.comingSoon.title(name), robots: { index: false } };
  const blurb = t.aisleBlurb[slug] ?? null;
  const isPhones = slug === "telephones";
  const base = isPhones ? t.collection.metaPhonesTitle : t.collection.metaAisleTitle(name);
  // Page 2, 3…: their own title (otherwise every page of the aisle has the same one).
  const title = Number.isInteger(pageNo) && pageNo > 1 ? `${base} - ${t.pagination.titleSuffix(pageNo)}` : base;
  const description = isPhones ? t.collection.metaPhonesDescription : t.collection.metaAisleDescription(name, blurb);
  const alt = alternates(locale, path);
  return {
    title,
    description,
    alternates: alt,
    openGraph: { title: `${title} | Electro Zaki`, description, url: alt.canonical },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filterParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  if (!aisleOpen(slug, category.parent?.slug)) {
    const t = await getT();
    return <ComingSoon name={categoryName(t, slug, category.name)} art={artFor(slug, category.name)} />;
  }

  // All at once: none of these needs another's answer.
  const [modelPages, options, aisles, t, groups] = await Promise.all([
    slug === "telephones" ? getModelPages() : Promise.resolve([]),
    getCategoryFilterOptions(slug),
    getAisles(),
    getT(),
    getFacetGroups(slug),
  ]);
  const models = [...modelPages].sort((a, b) => b.units.length - a.units.length);
  const phones = options.kind === "phones";
  const str = (v?: string) => (typeof v === "string" && v ? v.slice(0, 80) : undefined);
  const int = (v?: string) => (v && Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined);

  // Only the filters that belong to this kind of category are applied.
  const filters = {
    brand: str(filterParams.brand),
    q: str(filterParams.q),
    promo: filterParams.promo === "1" || undefined,
    maxPrice: int(filterParams.maxPrice),
    condition: phones && GRADES.has(filterParams.condition ?? "") ? filterParams.condition : undefined,
    minBatteryHealth: phones ? int(filterParams.minBattery) : undefined,
    storage: phones ? str(filterParams.storage) : undefined,
    subcategory: phones ? undefined : str(filterParams.type),
    compatibleWith: phones ? undefined : str(filterParams.fits),
  };

  const fetched = await getProductsByCategorySlug(slug, filters);
  const price = (p: (typeof fetched)[number]) => Number(p.recommendedSalePrice.toString());

  // The aisle's guide (see AisleGuide): the answers are in the address, one
  // option per checklist group, plus a budget band.
  const basePath = `/collections/${slug}`;
  const selection = readSelection(groups, filterParams);
  const budget = groups.length ? readBudget(filterParams.budget) : undefined;
  const inBudget = (p: (typeof fetched)[number]) => !budget || budgetOf(price(p)) === budget;
  const all = fetched.filter((p) => matchesSelection(p.facets, selection) && inBudget(p));

  const guideHref = (changes: Record<string, string | undefined>) => {
    const next: Record<string, string | undefined> = { ...selection, budget, ...changes };
    for (const k of ["q", "brand", "promo", "type", "fits", "maxPrice", "sort"] as const) next[k] ??= str(filterParams[k]);
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) query.set(k, v);
    const s = query.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  // A question is only asked when it can tell products apart: options no
  // product here carries (nobody ticked them yet) are left out.
  const steps: GuideStep[] = groups
    .filter((group) => group.question)
    .map((group) => {
      const others = fetched.filter((p) => matchesSelection(p.facets, selection, group.key) && inBudget(p));
      return {
        key: group.key,
        question: facetQuestion(t, group),
        kind: group.display === "TILES" ? ("tiles" as const) : group.display === "METER" ? ("meter" as const) : ("chips" as const),
        options: group.options
          .filter((o) => selection[group.key] === o.key || fetched.some((p) => hasOption(p.facets, group.key, o.key)))
          .map((o) => {
            const on = selection[group.key] === o.key;
            const having = others.filter((p) => hasOption(p.facets, group.key, o.key));
            return {
              key: o.key,
              label: facetOptionName(t, group.key, o),
              count: having.length,
              on,
              href: guideHref({ [group.key]: on ? undefined : o.key }),
              image: group.display === "TILES" ? (having.find((p) => p.images[0])?.images[0].url ?? null) : null,
              level: o.level,
            };
          }),
      };
    })
    .filter((step) => step.options.length > 1 || step.options.some((o) => o.on));
  const guided = steps.length > 0;
  if (guided) {
    const inSelection = fetched.filter((p) => matchesSelection(p.facets, selection));
    steps.push({
      key: "budget",
      question: t.guide.budget,
      kind: "chips",
      options: BUDGET_BANDS.map((band) => ({
        key: band.key,
        label: t.guide.bandName[band.key] ?? band.key,
        detail:
          band.max === null
            ? t.guide.over(formatMAD(band.min))
            : band.min === 0
              ? t.guide.upTo(formatMAD(band.max))
              : t.guide.between(band.min, formatMAD(band.max)),
        count: inSelection.filter((p) => budgetOf(price(p)) === band.key).length,
        on: budget === band.key,
        href: guideHref({ budget: budget === band.key ? undefined : band.key }),
      })),
    });
  }
  const guideKeys = guided ? [...groups.map((g) => g.key), "budget"] : [];
  // Groups without a question (material, extras): filters in the sheet.
  const moreFilters = groups
    .filter((group) => !group.question)
    .map((group) => ({
      key: group.key,
      name: group.name,
      options: group.options
        .filter((o) => selection[group.key] === o.key || fetched.some((p) => hasOption(p.facets, group.key, o.key)))
        .map((o) => ({ key: o.key, label: facetOptionName(t, group.key, o) })),
    }))
    .filter((group) => group.options.length > 1 || selection[group.key]);
  const modelStep = steps.find((s) => s.key === MODEL_GROUP);
  const pickedModel = modelStep?.options.find((o) => o.on);
  // What each card says about itself: that it fits the picked phone, and
  // its first tick in the next groups ("Luxe · Antichoc").
  const traitGroups = groups.filter((g) => g.key !== MODEL_GROUP).slice(0, 3);
  const ficheOf = (p: (typeof fetched)[number]) => ({
    fits: pickedModel ? t.guide.fits(pickedModel.label) : undefined,
    traits: traitGroups
      .flatMap((g) => optionsIn(p.facets, g.key).slice(0, 1).map((o) => facetOptionName(t, g.key, o)))
      .slice(0, 2),
  });

  // Sorting and paging happen here: a whole aisle is at most a few hundred
  // rows, already fetched in one query for the filters above.
  const sorted =
    filterParams.sort === "prix-asc"
      ? [...all].sort((a, b) => price(a) - price(b))
      : filterParams.sort === "prix-desc"
        ? [...all].sort((a, b) => price(b) - price(a))
        : all;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pageCount, int(filterParams.page) ?? 1);
  const products = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // A search (and nothing else) that found nothing here: say it isn't in
  // stock, offer to be told when it arrives, and show the aisle's closest
  // products (the same search with its last words dropped). In the phones
  // aisle, a search for accessories says they're sold in the shop.
  const searchOnly =
    Boolean(filters.q) &&
    Object.entries(filters).every(([k, v]) => k === "q" || !v) &&
    !Object.keys(selection).length &&
    !budget;
  let closest: { query: string; products: typeof fetched } | null = null;
  let shopOnly = false;
  if (searchOnly && all.length === 0) {
    for (const shorter of shorterQueries(filters.q!)) {
      const found = await getProductsByCategorySlug(slug, { ...filters, q: shorter });
      if (found.length) {
        const inStockFirst = [...found].sort((a, b) => Number(b.availability === "IN_STOCK") - Number(a.availability === "IN_STOCK"));
        closest = { query: shorter, products: inStockFirst.slice(0, 8) };
        break;
      }
    }
    if (!closest) shopOnly = phones && (await countShopOnlyAccessories(filters.q!)) > 0;
  }

  // Aisle chips: the children of a parent aisle, or a leaf's siblings.
  const groupSlug = category.parent?.slug ?? slug;
  const siblings = aisles.filter((a) => a.parentSlug === groupSlug);
  const current = aisles.find((a) => a.slug === slug);
  // How much stock there is stays private; what it costs is the useful part.
  const prices = (current ? [current] : siblings).map((a) => a.fromPrice).filter((p): p is number => p !== null);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const filtered = Object.values(filters).some(Boolean) || Object.keys(selection).length > 0 || Boolean(budget);
  const title = categoryName(t, slug, category.name);

  const crumbs = [
    { name: t.common.home, path: "/" },
    ...(category.parent
      ? [{ name: categoryName(t, category.parent.slug, category.parent.name), path: `/collections/${category.parent.slug}` }]
      : []),
    { name: title, path: `/collections/${slug}` },
  ];

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper-2/60">
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 pb-8 pt-8 sm:pt-10 md:grid-cols-[1fr_auto]">
          <div>
            <Breadcrumbs items={crumbs} />
            {/* The phones aisle says what it sells, in the words people search
                ("téléphones d'occasion Meknès"), not just "Téléphones". */}
            {phones ? (
              <h1 className="font-display mt-4 text-[2rem] font-extrabold leading-[1.05] text-ink sm:text-5xl">{t.collection.metaPhonesTitle}</h1>
            ) : (
              <h1 className="font-display mt-4 text-[2.4rem] font-extrabold leading-none text-ink sm:text-6xl">{title}</h1>
            )}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {phones ? t.collection.introPhones : t.collection.introAisle(t.aisleBlurb[slug] ?? null, title)}
            </p>
            {/* Each model's own page (every unit of it in stock), most stocked first. */}
            {phones && models.length > 1 && (
              <nav aria-label={t.collection.byModel} className="mt-5">
                <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{t.collection.byModel}</p>
                <ul className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <li key={m.slug}>
                      <Link
                        href={`/telephones/${m.slug}`}
                        className="inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-[13px] font-semibold text-ink ring-1 ring-ink/10 transition-shadow hover:ring-ink/30"
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <DeviceArt kind={artFor(slug, category.name)} className="h-28 w-28 text-ink" />
            {fromPrice !== null && (
              <p className="text-end">
                <span className="block font-mono text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
                  {t.common.fromLong}
                </span>
                <span className="readout mt-1 block text-5xl font-bold text-ink">{formatMAD(fromPrice)}</span>
              </p>
            )}
          </div>
        </div>

        {siblings.length > 1 && (
          <div className="mx-auto max-w-7xl px-4 pb-6">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none" aria-label={t.common.aisles}>
              {category.parent && (
                <li className="flex-none">
                  <Link
                    href={`/collections/${category.parent.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                  >
                    {t.collection.seeAll}
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
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full ps-1.5 pe-4 text-sm font-semibold transition-colors ${
                        on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-white/10" : "bg-paper"}`}>
                        <DeviceArt kind={artFor(a.slug, a.name)} className={`h-6 w-6 ${on ? "text-white" : "text-ink"}`} />
                      </span>
                      {categoryName(t, a.slug, a.name)}
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

        {guided && (
          <AisleGuide
            steps={steps}
            total={all.length}
            restartHref={Object.keys(selection).length || budget ? guideHref(Object.fromEntries(guideKeys.map((k) => [k, undefined]))) : null}
            art={artFor(slug, category.name)}
            remembered={
              modelStep && (
                <RememberedPhone
                  picked={pickedModel ? { key: pickedModel.key, name: pickedModel.label } : null}
                  hrefs={Object.fromEntries(modelStep.options.filter((o) => o.count > 0).map((o) => [o.key, o.href]))}
                />
              )
            }
          />
        )}

        <CatalogBar
          options={options}
          basePath={basePath}
          defaults={filterParams}
          guide={
            guided
              ? {
                  keys: guideKeys,
                  labels: {
                    ...Object.fromEntries(steps.flatMap((s) => s.options.filter((o) => o.on).map((o) => [s.key, o.label]))),
                    ...Object.fromEntries(
                      moreFilters.flatMap((g) => g.options.filter((o) => selection[g.key] === o.key).map((o) => [g.key, o.label]))
                    ),
                  },
                  more: moreFilters,
                }
              : undefined
          }
        />

        <div className="pt-6 sm:pt-8">
          <div>
            {pageCount > 1 && (
              <p className="sr-only" aria-live="polite">
                {t.pagination.pageOf(page, pageCount)}
              </p>
            )}
            {products.length === 0 && searchOnly ? (
              <>
                <NoExactMatch query={filters.q!} closest={closest?.query ?? null} shopOnly={shopOnly} t={t} />
                {closest && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {closest.products.map((product, i) => (
                      <ProductCard key={product.id} product={product} priority={i < 4} />
                    ))}
                  </div>
                )}
              </>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
                <DeviceArt kind={artFor(slug, category.name)} className="h-24 w-24 text-neutral-400" />
                <p className="font-display mt-4 text-2xl font-bold text-ink">
                  {filtered ? t.collection.emptyFilteredTitle : t.collection.emptyTitle}
                </p>
                <p className="mt-2 max-w-md text-neutral-600">
                  {filtered ? t.collection.emptyFilteredText : t.collection.emptyText}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {/* Nothing for these filters: one tap back to the whole aisle. */}
                  {filtered && (
                    <LinkButton href={basePath} variant="outline" scroll={false}>
                      {t.filters.clearAll}
                    </LinkButton>
                  )}
                  <AnchorButton
                    href={whatsappLink(t.collection.waLookingFor(title, filters.q))}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                  >
                    <MessageCircle size={18} aria-hidden /> {t.collection.askWhatsapp}
                  </AnchorButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} fiche={guided ? ficheOf(product) : undefined} />
                ))}
              </div>
            )}
            <Pagination
              page={page}
              pageCount={pageCount}
              basePath={basePath}
              params={filterParams as Record<string, string | undefined>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
