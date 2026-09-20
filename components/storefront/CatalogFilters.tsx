"use client";

import { useRef } from "react";
import { Button, AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";

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
  { value: "80", label: "80% ou plus" },
];

type Props = {
  brands: string[];
  basePath: string;
  defaults: { brand?: string; condition?: string; minBattery?: string; maxPrice?: string };
};

export function CatalogFilters({ brands, basePath, defaults }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} method="get" className={cardClasses("space-y-5 p-4")}>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Marque
        </label>
        <select
          name="brand"
          defaultValue={defaults.brand ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="">Toutes marques</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          État
        </label>
        <select
          name="condition"
          defaultValue={defaults.condition ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Batterie (iPhone)
        </label>
        <select
          name="minBattery"
          defaultValue={defaults.minBattery ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
        >
          {BATTERY_TIERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Budget max (MAD)
        </label>
        <input
          type="number"
          name="maxPrice"
          placeholder="Ex: 4000"
          defaultValue={defaults.maxPrice ?? ""}
          className="min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
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

