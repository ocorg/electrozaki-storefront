"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Form from "next/form";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { CategoryFilterOptions } from "@/lib/db/public-products";
import Link from "@/components/i18n/Link";
import { useLocalePath, useT } from "@/components/i18n/I18nProvider";
import { categoryName } from "@/lib/i18n/labels";
import { formatMAD } from "@/lib/format";
import { artFor } from "@/lib/category-art";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { GradeMeter } from "@/components/storefront/GradeMeter";

export type FilterValues = {
  brand?: string;
  condition?: string;
  minBattery?: string;
  maxPrice?: string;
  storage?: string;
  type?: string;
  fits?: string;
  q?: string;
  promo?: string;
  sort?: string;
  page?: string;
};

type Key = keyof FilterValues;

const GRADES = ["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"] as const;
const BATTERY_TIERS = ["90", "85", "80"] as const;
const BUDGETS = { phones: [1500, 2500, 3500, 5000, 8000], accessories: [50, 100, 200, 500] };
// Everything a visitor can narrow by (sort and page are not "filters").
const FILTER_KEYS: Key[] = ["q", "brand", "condition", "minBattery", "storage", "type", "fits", "maxPrice", "promo"];

type Props = {
  options: CategoryFilterOptions;
  basePath: string;
  defaults: FilterValues;
};

// Brands are typed by hand in the ERP ("Apple", "APPLE"): one chip per brand
// whatever the case, preferring the spelling that isn't all capitals. The
// brand filter ignores case, so that chip still matches every spelling.
function uniqueBrands(brands: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const raw of brands) {
    const b = raw.trim();
    const key = b.toLowerCase();
    const prev = byKey.get(key);
    if (!prev || (prev === prev.toUpperCase() && b !== b.toUpperCase())) byKey.set(key, b);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "fr"));
}

// A form submits every field, empty ones too ("?sort=&storage=…"). Disabled
// fields are left out, and next/form builds the URL after onSubmit — so
// disabling the empty ones keeps the address clean and shareable.
function dropEmptyFields(form: HTMLFormElement) {
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLSelectElement && !el.value) el.disabled = true;
    if (el instanceof HTMLInputElement && !el.value && (el.type !== "radio" || el.checked)) el.disabled = true;
  }
}

/**
 * The catalogue's command bar: search, sort, one-tap quick chips and the
 * active filters as removable pills, with every other filter in a settings
 * sheet (bottom sheet on phones, side drawer on desktop). Chips, pills and
 * sort are plain links — instant, crawlable, and they work without JS.
 */
export function CatalogBar({ options, basePath, defaults }: Props) {
  const t = useT();
  const withLocale = useLocalePath();
  const action = withLocale(basePath);
  const phones = options.kind === "phones";
  const brands = uniqueBrands(options.brands);
  const SORTS = [
    { value: "", label: t.filters.sortNew, aria: t.filters.sortNewAria },
    { value: "prix-asc", label: t.filters.sortAsc, aria: t.filters.sortAscAria },
    { value: "prix-desc", label: t.filters.sortDesc, aria: t.filters.sortDescAria },
  ];
  const sheetRef = useRef<HTMLDialogElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Current params without the page number: any change starts at page 1.
  const current: Partial<Record<Key, string>> = {};
  for (const k of [...FILTER_KEYS, "sort"] as Key[]) if (defaults[k]) current[k] = String(defaults[k]);
  const qs = new URLSearchParams(current as Record<string, string>).toString();
  // A link may carry another spelling ("APPLE"): light up the matching chip.
  const brandValue = current.brand
    ? (brands.find((b) => b.toLowerCase() === current.brand!.toLowerCase()) ?? current.brand)
    : undefined;

  const href = (changes: Partial<Record<Key, string | undefined>>) => {
    const next = { ...current, ...changes };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const toggle = (k: Key, v: string) => href({ [k]: current[k] === v ? undefined : v });

  // After a filter change, bring the top of the results back into view
  // (the bar is sticky, so the visitor may be deep in the old grid).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      top.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
  }, [qs]);

  const labelFor = (k: Key, v: string): string => {
    switch (k) {
      case "q":
        return `« ${v} »`;
      case "condition":
        return t.grades.label[v] ?? v;
      case "minBattery":
        return t.filters.batteryMin(v);
      case "maxPrice":
        return t.filters.upTo(formatMAD(Number(v)));
      case "type":
        return categoryName(t, v, options.subcategories.find((s) => s.slug === v)?.name ?? v);
      case "fits":
        return t.filters.fits(options.phoneModels.find((m) => m.key === v)?.name ?? v);
      case "promo":
        return t.filters.onPromo;
      default:
        return v;
    }
  };

  const budgets = phones ? BUDGETS.phones : BUDGETS.accessories;
  // Filters already shown as a lit quick chip don't also need a pill.
  const quick = new Set<Key>(phones ? ["condition", "promo"] : ["promo"]);
  if (!phones && current.maxPrice && budgets.includes(Number(current.maxPrice))) quick.add("maxPrice");
  const active = FILTER_KEYS.filter((k) => current[k]);
  const pills = active.filter((k) => !quick.has(k));
  const sheetCount = active.filter((k) => k !== "q").length;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="catalog-bar sticky top-(--header-h) z-30 -mx-4 border-b border-ink/10 bg-paper/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Form
            key={qs}
            action={action}
            scroll={false}
            onSubmit={(e) => dropEmptyFields(e.currentTarget)}
            className="min-w-0 flex-1"
            role="search"
          >
            {/* Searching keeps the other filters. */}
            {Object.entries(current).map(([k, v]) =>
              k === "q" ? null : <input key={k} type="hidden" name={k} value={v} />
            )}
            <label className="group flex h-12 items-center gap-2.5 rounded-full bg-white ps-4 pe-1.5 ring-1 ring-ink/10 transition-shadow focus-within:ring-2 focus-within:ring-ink">
              <Search size={18} className="flex-none text-neutral-500" aria-hidden />
              <span className="sr-only">{t.filters.searchLabel}</span>
              <input
                key={current.q ?? ""}
                type="search"
                name="q"
                defaultValue={current.q ?? ""}
                maxLength={60}
                enterKeyHint="search"
                placeholder={phones ? t.filters.searchPhones : t.filters.searchAccessories}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-neutral-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {current.q && (
                <Link
                  href={href({ q: undefined })}
                  scroll={false}
                  aria-label={t.filters.clearSearch}
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-neutral-500 hover:bg-paper hover:text-ink"
                >
                  <X size={16} aria-hidden />
                </Link>
              )}
            </label>
          </Form>

          <nav aria-label={t.filters.sortNav} className="hidden h-12 flex-none items-center rounded-full bg-white p-1 ring-1 ring-ink/10 md:flex">
            {SORTS.map((s) => {
              const on = (current.sort ?? "") === s.value;
              return (
                <Link
                  key={s.value || "new"}
                  href={href({ sort: s.value || undefined })}
                  scroll={false}
                  aria-label={s.aria}
                  aria-current={on ? "true" : undefined}
                  className={`readout flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                    on ? "bg-ink text-white" : "text-neutral-600 hover:text-ink"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => sheetRef.current?.showModal()}
            aria-haspopup="dialog"
            className="relative flex h-12 flex-none items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97] sm:px-5"
          >
            <SlidersHorizontal size={17} aria-hidden />
            <span className="hidden sm:inline">{t.filters.filters}</span>
            <span className="sr-only sm:hidden">{t.filters.filters}</span>
            {sheetCount > 0 && (
              <span className="readout flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                {sheetCount}
                <span className="sr-only"> {t.filters.active}</span>
              </span>
            )}
          </button>
        </div>

        {/* Quick chips: one tap on, one tap off. */}
        <ul aria-label={t.filters.quick} className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 scrollbar-none">
          {phones
            ? GRADES.map((g) => {
                const on = current.condition === g;
                return (
                  <li key={g} className="flex-none">
                    <QuickChip href={toggle("condition", g)} on={on}>
                      <GradeMeter grade={g} tone={on ? "dark" : "light"} />
                    </QuickChip>
                  </li>
                );
              })
            : budgets.map((b) => (
                <li key={b} className="flex-none">
                  <QuickChip href={toggle("maxPrice", String(b))} on={current.maxPrice === String(b)}>
                    <span className="readout">≤ {formatMAD(b)}</span>
                  </QuickChip>
                </li>
              ))}
          {options.hasPromos && (
            <li className="flex-none">
              <QuickChip href={toggle("promo", "1")} on={current.promo === "1"}>
                <span aria-hidden className="h-2 w-2 rounded-full bg-red-600" /> {t.filters.onPromo}
              </QuickChip>
            </li>
          )}
        </ul>

        {pills.length > 0 && (
          <ul aria-label={t.filters.activeList} className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {pills.map((k) => (
              <li key={k}>
                <Link
                  href={href({ [k]: undefined })}
                  scroll={false}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-gold/15 ps-3 pe-2 text-[13px] font-semibold text-ink ring-1 ring-gold/40 transition-colors hover:bg-gold/25"
                >
                  {labelFor(k, current[k]!)}
                  <X size={14} aria-hidden />
                  <span className="sr-only">{t.filters.remove}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={href(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])))}
                scroll={false}
                className="inline-flex min-h-9 items-center px-2 text-[13px] font-semibold text-neutral-600 underline underline-offset-2 hover:text-ink"
              >
                {t.filters.clearAll}
              </Link>
            </li>
          </ul>
        )}
      </div>

      <dialog
        ref={sheetRef}
        aria-labelledby="sheet-title"
        className="sheet"
        onClick={(e) => {
          // A click on the backdrop (the dialog itself, outside its panel) closes it.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <Form
          key={qs}
          action={action}
          scroll={false}
          onSubmit={(e) => {
            dropEmptyFields(e.currentTarget);
            sheetRef.current?.close();
          }}
          className="flex h-full max-h-[inherit] flex-col"
        >
          <div className="flex-none px-5 pb-3 pt-2.5">
            <span aria-hidden className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-ink/15 md:hidden" />
            <div className="flex items-center justify-between">
              <h2 id="sheet-title" className="font-display text-2xl font-extrabold text-ink">
                {t.filters.filters}
              </h2>
              <button
                type="button"
                onClick={() => sheetRef.current?.close()}
                aria-label={t.common.close}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 pb-6">
            {current.q && <input type="hidden" name="q" value={current.q} />}

            <Group title={t.filters.sortBy}>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 ring-1 ring-ink/10">
                {SORTS.map((s) => (
                  <label
                    key={s.value || "new"}
                    className="readout flex min-h-11 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-neutral-600 transition-colors has-checked:bg-ink has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                  >
                    <input type="radio" name="sort" value={s.value} defaultChecked={(current.sort ?? "") === s.value} className="sr-only" />
                    <span aria-hidden>{s.label}</span>
                    <span className="sr-only">{s.aria}</span>
                  </label>
                ))}
              </div>
            </Group>

            {phones ? (
              <>
                {brands.length > 1 && (
                  <Group title={t.filters.brand}>
                    <Chips name="brand" all={t.filters.allBrands} current={brandValue} items={brands.map((b) => ({ value: b, label: b }))} />
                  </Group>
                )}

                <Group title={t.filters.condition}>
                  <div className="divide-y divide-ink/6 overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
                    <RadioRow name="condition" value="" checked={!current.condition}>
                      <span className="text-sm font-semibold text-ink">{t.filters.allConditions}</span>
                    </RadioRow>
                    {GRADES.map((g) => (
                      <RadioRow key={g} name="condition" value={g} checked={current.condition === g}>
                        <GradeMeter grade={g} size="md" />
                        <span className="mt-0.5 block text-xs text-neutral-600">{t.grades.hint[g]}</span>
                      </RadioRow>
                    ))}
                  </div>
                </Group>

                <Group title={t.filters.battery} hint={t.filters.batteryHint}>
                  <div className="grid grid-cols-4 gap-2">
                    {["", ...BATTERY_TIERS].map((tier) => (
                      <label
                        key={tier || "all"}
                        className="group flex min-h-22 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-ink/10 transition-colors hover:ring-ink/30 has-checked:bg-ink has-checked:ring-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                      >
                        <input type="radio" name="minBattery" value={tier} defaultChecked={(current.minBattery ?? "") === tier} className="sr-only" />
                        <Battery level={tier ? Number(tier) : null} />
                        <span className="readout text-xs font-semibold text-ink group-has-checked:text-white">
                          {tier ? <span dir="ltr">{tier} %+</span> : t.filters.anyBattery}
                        </span>
                      </label>
                    ))}
                  </div>
                </Group>

                {options.storages.length > 1 && (
                  <Group title={t.filters.storage}>
                    <Chips name="storage" all={t.filters.anyStorage} current={current.storage} items={options.storages.map((s) => ({ value: s, label: s }))} />
                  </Group>
                )}
              </>
            ) : (
              <>
                {options.subcategories.length > 1 && (
                  <Group title={t.filters.type}>
                    <Chips
                      name="type"
                      all={t.filters.anyType}
                      current={current.type}
                      items={options.subcategories.map((s) => ({
                        value: s.slug,
                        label: (
                          <>
                            <DeviceArt kind={artFor(s.slug, s.name)} className="-ms-1 h-6 w-6" />
                            {categoryName(t, s.slug, s.name)}
                          </>
                        ),
                      }))}
                    />
                  </Group>
                )}

                {options.phoneModels.length > 0 && (
                  <Group title={t.filters.compatible}>
                    <label className="relative block">
                      <span className="sr-only">{t.filters.phoneModel}</span>
                      <select
                        name="fits"
                        defaultValue={current.fits ?? ""}
                        className="h-12 w-full appearance-none rounded-2xl bg-white ps-4 pe-10 text-[15px] font-semibold text-ink ring-1 ring-ink/10 focus:outline-2 focus:outline-offset-2 focus:outline-ink"
                      >
                        <option value="">{t.filters.anyPhone}</option>
                        {options.phoneModels.map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={18} aria-hidden className="pointer-events-none absolute inset-e-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    </label>
                  </Group>
                )}

                {brands.length > 1 && (
                  <Group title={t.filters.brand}>
                    <Chips name="brand" all={t.filters.allBrands} current={brandValue} items={brands.map((b) => ({ value: b, label: b }))} />
                  </Group>
                )}
              </>
            )}

            <Group title={t.filters.budget}>
              <Chips
                name="maxPrice"
                all={t.filters.anyPrice}
                current={current.maxPrice}
                items={[
                  ...budgets.map((b) => ({ value: String(b), label: <span className="readout">≤ {formatMAD(b)}</span> })),
                  // A budget typed in the URL that isn't one of the presets still shows, selected.
                  ...(current.maxPrice && !budgets.includes(Number(current.maxPrice))
                    ? [{ value: current.maxPrice, label: <span className="readout">≤ {formatMAD(Number(current.maxPrice))}</span> }]
                    : []),
                ]}
              />
            </Group>

            {options.hasPromos && (
              <label className="group flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 ring-1 ring-ink/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
                <span>
                  <span className="block text-sm font-bold text-ink">{t.filters.promoOnly}</span>
                  <span className="block text-xs text-neutral-600">{t.filters.promoOnlyHint}</span>
                </span>
                <input type="checkbox" name="promo" value="1" defaultChecked={current.promo === "1"} className="sr-only" />
                {/* iOS-style switch, driven by the checkbox above */}
                <span
                  aria-hidden
                  className="relative h-8 w-13 flex-none rounded-full bg-ink/15 transition-colors duration-300 group-has-checked:bg-signal"
                >
                  <span className="absolute inset-s-1 top-1 h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.25)] transition-transform duration-300 ease-spring group-has-checked:translate-x-5 rtl:group-has-checked:-translate-x-5" />
                </span>
              </label>
            )}
          </div>

          <div className="flex flex-none items-center gap-3 border-t border-ink/10 bg-paper px-5 py-4">
            <Link
              href={href(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])))}
              scroll={false}
              onClick={() => sheetRef.current?.close()}
              className="min-h-12 flex-none px-2 py-3 text-sm font-semibold text-neutral-600 underline underline-offset-2 hover:text-ink"
            >
              {t.filters.clearAll}
            </Link>
            <button
              type="submit"
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-gold px-6 text-[15px] font-bold text-ink transition-transform active:scale-[0.98]"
            >
              {t.filters.show}
            </button>
          </div>
        </Form>
      </dialog>
    </div>
  );
}

function QuickChip({ href, on, children }: { href: string; on: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-pressed={on}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
        on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
      }`}
    >
      {children}
      {on && <X size={13} aria-hidden className="-me-0.5 opacity-70" />}
    </Link>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 flex w-full items-baseline justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {title}
        {hint && <span className="normal-case tracking-normal text-neutral-500">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Chips({
  name,
  all,
  current,
  items,
}: {
  name: string;
  all: string;
  current?: string;
  items: { value: string; label: ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[{ value: "", label: all }, ...items].map((it) => (
        <label
          key={it.value || "all"}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 transition-colors hover:ring-ink/30 has-checked:bg-ink has-checked:text-white has-checked:ring-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
        >
          <input type="radio" name={name} value={it.value} defaultChecked={(current ?? "") === it.value} className="sr-only" />
          {it.label}
        </label>
      ))}
    </div>
  );
}

function RadioRow({ name, value, checked, children }: { name: string; value: string; checked: boolean; children: ReactNode }) {
  return (
    <label className="group flex min-h-14 cursor-pointer items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper has-checked:bg-gold/10 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ink">
      <span className="min-w-0">{children}</span>
      <input type="radio" name={name} value={value} defaultChecked={checked} className="sr-only" />
      <span
        aria-hidden
        className="flex h-6 w-6 flex-none items-center justify-center rounded-full ring-2 ring-ink/20 transition-colors group-has-checked:bg-ink group-has-checked:ring-ink"
      >
        <span className="h-2 w-2 scale-0 rounded-full bg-white transition-transform duration-300 ease-spring group-has-checked:scale-100" />
      </span>
    </label>
  );
}

/** A battery outline filled to `level` %, or empty for "any". */
function Battery({ level }: { level: number | null }) {
  const fill = level === null ? "bg-transparent" : level >= 85 ? "bg-signal" : "bg-amber-500";
  return (
    <span aria-hidden dir="ltr" className="relative flex h-5 w-9 items-center rounded-[5px] p-0.5 ring-2 ring-ink/70 group-has-checked:ring-white/80">
      <span className={`h-full rounded-xs ${fill}`} style={{ width: level === null ? 0 : `${level}%` }} />
      <span className="absolute -right-1.25 top-1/2 h-2 w-0.75 -translate-y-1/2 rounded-r-sm bg-ink/70 group-has-checked:bg-white/80" />
      {level === null && <span className="readout absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink group-has-checked:text-white">∗</span>}
    </span>
  );
}
