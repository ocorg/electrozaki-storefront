"use client";

import { useId, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button, AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import type { CategoryFilterOptions } from "@/lib/db/public-products";
import { Select } from "@/components/ui/Select";

const CONDITIONS = [
  { value: "", label: "Tous états" },
  { value: "NEUF", label: "Neuf" },
  { value: "TRES_BON", label: "Très bon état" },
  { value: "BON", label: "Bon état" },
  { value: "PIECES_REMPLACEES", label: "Pièces remplacées" },
];

const BATTERY_TIERS = [
  { value: "", label: "Toutes batteries" },
  { value: "90", label: "90% ou plus" },
  { value: "85", label: "85% ou plus" },
  { value: "80", label: "80% ou plus" },
];

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

export const SORTS = [
  { value: "", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

type Props = {
  options: CategoryFilterOptions;
  basePath: string;
  defaults: FilterValues;
};

const fieldClass =
  "min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
      {children}
    </label>
  );
}

function FilterSelect({ name, label, value, items, all, onChange }: {
  name: keyof FilterValues;
  label: string;
  value?: string;
  items: { value: string; label: string }[];
  all?: string;
  onChange: () => void;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} name={name} defaultValue={value ?? ""} onChange={onChange} className={fieldClass}>
        {all && <option value="">{all}</option>}
        {items.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

// Phones and accessories don't share filters: a cable has no battery or
// grade, a phone has no "fits which model".
export function CatalogFilters({ options, basePath, defaults }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();
  const brands = options.brands.map((b) => ({ value: b, label: b }));
  const [open, setOpen] = useState(false);
  const searchId = useId();
  const priceId = useId();
  const active = (["brand", "condition", "minBattery", "maxPrice", "storage", "type", "fits", "q", "promo"] as const).filter(
    (k) => Boolean(defaults[k])
  ).length;

  return (
    <>
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-controls="filtres"
      className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 md:hidden"
    >
      <span className="flex items-center gap-2">
        <SlidersHorizontal size={17} aria-hidden /> Filtrer et trier
        {active > 0 && (
          <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{active}</span>
        )}
      </span>
      {open ? <X size={18} aria-hidden /> : <span aria-hidden className="text-neutral-500">+</span>}
    </button>
    <form
      id="filtres"
      ref={formRef}
      method="get"
      aria-label="Filtres"
      className={cardClasses(`mt-3 space-y-5 p-5 md:sticky md:top-28 md:mt-0 md:block ${open ? "block" : "hidden"}`)}
    >
      <FilterSelect name="sort" label="Trier par" value={defaults.sort} items={SORTS} onChange={submit} />
      <div>
        <Label htmlFor={searchId}>Rechercher</Label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            id={searchId}
            type="search"
            name="q"
            defaultValue={defaults.q ?? ""}
            maxLength={60}
            enterKeyHint="search"
            placeholder={options.kind === "phones" ? "Ex : iPhone 13, A54…" : "Ex : coque iPhone 13…"}
            className={`${fieldClass} pl-9`}
          />
        </div>
      </div>
      {options.hasPromos && (
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700">
          <input
            type="checkbox"
            name="promo"
            value="1"
            defaultChecked={defaults.promo === "1"}
            onChange={submit}
            className="h-4 w-4 accent-red-600"
          />
          En promo uniquement
        </label>
      )}
      {options.kind === "phones" ? (
        <>
          <FilterSelect name="brand" label="Marque" value={defaults.brand} items={brands} all="Toutes marques" onChange={submit} />
          <FilterSelect name="condition" label="État" value={defaults.condition} items={CONDITIONS} onChange={submit} />
          {options.storages.length > 1 && (
            <FilterSelect
              name="storage"
              label="Stockage"
              value={defaults.storage}
              items={options.storages.map((s) => ({ value: s, label: s }))}
              all="Tous stockages"
              onChange={submit}
            />
          )}
          <FilterSelect name="minBattery" label="Batterie (occasion)" value={defaults.minBattery} items={BATTERY_TIERS} onChange={submit} />
        </>
      ) : (
        <>
          {options.subcategories.length > 1 && (
            <FilterSelect
              name="type"
              label="Type"
              value={defaults.type}
              items={options.subcategories.map((c) => ({ value: c.slug, label: c.name }))}
              all="Tous les accessoires"
              onChange={submit}
            />
          )}
          {options.phoneModels.length > 0 && (
            <FilterSelect
              name="fits"
              label="Compatible avec"
              value={defaults.fits}
              items={options.phoneModels.map((m) => ({ value: m.key, label: m.name }))}
              all="Tous les téléphones"
              onChange={submit}
            />
          )}
          {brands.length > 1 && (
            <FilterSelect name="brand" label="Marque" value={defaults.brand} items={brands} all="Toutes marques" onChange={submit} />
          )}
        </>
      )}

      <div>
        <Label htmlFor={priceId}>Budget max (DH)</Label>
        <input
          id={priceId}
          type="number"
          inputMode="numeric"
          name="maxPrice"
          min={0}
          placeholder={options.kind === "phones" ? "Ex: 4000" : "Ex: 150"}
          defaultValue={defaults.maxPrice ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">
          Filtrer
        </Button>
        <AnchorButton href={basePath} variant="outline" size="sm">
          Réinitialiser
        </AnchorButton>
      </div>
    </form>
    </>
  );
}
