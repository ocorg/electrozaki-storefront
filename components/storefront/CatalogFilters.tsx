"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
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
};

type Props = {
  options: CategoryFilterOptions;
  basePath: string;
  defaults: FilterValues;
};

const fieldClass =
  "min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
  return (
    <div>
      <Label>{label}</Label>
      <Select name={name} defaultValue={value ?? ""} onChange={onChange} className={fieldClass}>
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

  return (
    <form ref={formRef} method="get" className={cardClasses("space-y-5 p-4")}>
      <div>
        <Label>Rechercher</Label>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
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
        <Label>Budget max (MAD)</Label>
        <input
          type="number"
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
  );
}
