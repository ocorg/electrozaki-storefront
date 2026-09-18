"use client";

import { useRef } from "react";

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
    <form ref={formRef} method="get" className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Marque
        </label>
        <select
          name="brand"
          defaultValue={defaults.brand ?? ""}
          onChange={() => formRef.current?.requestSubmit()}
          className="min-h-11 w-full rounded border border-black/20 px-2 text-sm"
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
          className="min-h-11 w-full rounded border border-black/20 px-2 text-sm"
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
          className="min-h-11 w-full rounded border border-black/20 px-2 text-sm"
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
          className="min-h-11 w-full rounded border border-black/20 px-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded bg-[#121212] px-3 text-sm font-medium text-white"
        >
          Filtrer
        </button>
        <a
          href={basePath}
          className="flex min-h-11 items-center justify-center rounded border border-black/20 px-3 text-sm text-neutral-600"
        >
          Réinitialiser
        </a>
      </div>
    </form>
  );
}
