"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveProduct } from "@/app/admin/(dashboard)/products/actions";
import type { ProductInput } from "@/lib/db/admin-products";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";

const CONDITIONS = [
  { value: "NEUF", label: "Neuf" },
  { value: "TRES_BON", label: "Très bon état" },
  { value: "BON", label: "Bon état" },
  { value: "PIECES_REMPLACEES", label: "Pièces remplacées" },
] as const;

const AVAILABILITIES = [
  { value: "IN_STOCK", label: "En stock" },
  { value: "OUT_OF_STOCK", label: "Épuisé" },
  { value: "COMING_SOON", label: "Bientôt disponible" },
  { value: "DISCONTINUED", label: "Discontinué" },
] as const;

const inputClasses =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

type SpecRow = { key: string; value: string };
type VariantRow = { name: string; priceOverride: string; skuOrRef: string };

export type ProductFormInitial = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  condition: (typeof CONDITIONS)[number]["value"];
  isPhone: boolean;
  description: string;
  specs: SpecRow[];
  recommendedSalePrice: string;
  compareAtPrice: string;
  availability: (typeof AVAILABILITIES)[number]["value"];
  tags: string;
  batteryHealthPercent: string;
  faceIdWorking: "" | "true" | "false";
  screenGenuine: "" | "true" | "false";
  batteryGenuine: "" | "true" | "false";
  hasDefects: boolean;
  transparencyNotes: string;
  imageUrl: string;
  variants: VariantRow[];
  purchasePrice: string;
  minSalePrice: string;
  stockQuantity: string;
  supplier: string;
  sourceNote: string;
  internalNotes: string;
};

const EMPTY: Omit<ProductFormInitial, "id" | "categoryId"> = {
  slug: "",
  name: "",
  brand: "",
  condition: "NEUF",
  isPhone: false,
  description: "",
  specs: [],
  recommendedSalePrice: "",
  compareAtPrice: "",
  availability: "IN_STOCK",
  tags: "",
  batteryHealthPercent: "",
  faceIdWorking: "",
  screenGenuine: "",
  batteryGenuine: "",
  hasDefects: false,
  transparencyNotes: "",
  imageUrl: "",
  variants: [],
  purchasePrice: "",
  minSalePrice: "",
  stockQuantity: "0",
  supplier: "",
  sourceNote: "",
  internalNotes: "",
};

function toBool(v: "" | "true" | "false"): boolean | null {
  return v === "" ? null : v === "true";
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInitial>(
    initial ?? { ...EMPTY, id: "", categoryId: categories[0]?.id ?? "" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormInitial>(key: K, value: ProductFormInitial[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSpecRow() {
    set("specs", [...form.specs, { key: "", value: "" }]);
  }
  function updateSpecRow(index: number, field: "key" | "value", value: string) {
    const next = [...form.specs];
    next[index] = { ...next[index], [field]: value };
    set("specs", next);
  }
  function removeSpecRow(index: number) {
    set("specs", form.specs.filter((_, i) => i !== index));
  }

  function addVariantRow() {
    set("variants", [...form.variants, { name: "", priceOverride: "", skuOrRef: "" }]);
  }
  function updateVariantRow(index: number, field: keyof VariantRow, value: string) {
    const next = [...form.variants];
    next[index] = { ...next[index], [field]: value };
    set("variants", next);
  }
  function removeVariantRow(index: number) {
    set("variants", form.variants.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const input: ProductInput = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      categoryId: form.categoryId,
      condition: form.condition,
      isPhone: form.isPhone,
      description: form.description.trim() || null,
      specs: form.specs.length
        ? Object.fromEntries(form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]))
        : null,
      recommendedSalePrice: Number(form.recommendedSalePrice) || 0,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      availability: form.availability,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      batteryHealthPercent: form.batteryHealthPercent ? Number(form.batteryHealthPercent) : null,
      faceIdWorking: toBool(form.faceIdWorking),
      screenGenuine: toBool(form.screenGenuine),
      batteryGenuine: toBool(form.batteryGenuine),
      hasDefects: form.hasDefects,
      transparencyNotes: form.transparencyNotes.trim() || null,
      imageUrl: form.imageUrl || null,
      variants: form.variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          skuOrRef: v.skuOrRef.trim() || null,
        })),
      purchasePrice: Number(form.purchasePrice) || 0,
      minSalePrice: Number(form.minSalePrice) || Number(form.recommendedSalePrice) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      supplier: form.supplier.trim() || null,
      sourceNote: form.sourceNote.trim() || null,
      internalNotes: form.internalNotes.trim() || null,
    };

    const result = await saveProduct(initial?.id || null, input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Informations générales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Nom
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Slug (URL)
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Marque
            </label>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Catégorie
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputClasses}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              État
            </label>
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value as ProductFormInitial["condition"])}
              className={inputClasses}
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
              Disponibilité
            </label>
            <select
              value={form.availability}
              onChange={(e) => set("availability", e.target.value as ProductFormInitial["availability"])}
              className={inputClasses}
            >
              {AVAILABILITIES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPhone}
            onChange={(e) => set("isPhone", e.target.checked)}
            className="h-4 w-4"
          />
          Ce produit est un téléphone (déclenche l&apos;avance de 300 MAD au panier)
        </label>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Mots-clés (séparés par des virgules)
          </label>
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="apple, photo, gaming"
            className={inputClasses}
          />
        </div>
      </div>

      <div className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Prix &amp; stock</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Prix de vente (MAD)
            </label>
            <input
              type="number"
              required
              value={form.recommendedSalePrice}
              onChange={(e) => set("recommendedSalePrice", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Prix barré (optionnel, pour une promo)
            </label>
            <input
              type="number"
              value={form.compareAtPrice}
              onChange={(e) => set("compareAtPrice", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Quantité en stock
            </label>
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Prix d&apos;achat (interne)
            </label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => set("purchasePrice", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Prix plancher (interne)
            </label>
            <input
              type="number"
              value={form.minSalePrice}
              onChange={(e) => set("minSalePrice", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Fournisseur (interne)
            </label>
            <input value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className={inputClasses} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Notes internes (jamais visibles côté client)
          </label>
          <textarea
            rows={2}
            value={form.internalNotes}
            onChange={(e) => set("internalNotes", e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Image</h2>
        <AdminImageUpload currentUrl={form.imageUrl} onUploaded={(url) => set("imageUrl", url)} />
      </div>

      {form.isPhone && (
        <div className={cardClasses("space-y-4 p-5")}>
          <h2 className="font-semibold">Détails téléphone</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Batterie (%)
              </label>
              <input
                type="number"
                value={form.batteryHealthPercent}
                onChange={(e) => set("batteryHealthPercent", e.target.value)}
                className={inputClasses}
              />
            </div>
            {(
              [
                ["faceIdWorking", "Face ID fonctionnel"],
                ["screenGenuine", "Écran d'origine"],
                ["batteryGenuine", "Batterie d'origine"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {label}
                </label>
                <select
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value as "" | "true" | "false")}
                  className={inputClasses}
                >
                  <option value="">Non applicable</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.hasDefects}
              onChange={(e) => set("hasDefects", e.target.checked)}
              className="h-4 w-4"
            />
            Ce produit a des défauts à signaler (transparence)
          </label>
          {form.hasDefects && (
            <textarea
              rows={2}
              placeholder="Décrivez les défauts, affiché sur la fiche produit"
              value={form.transparencyNotes}
              onChange={(e) => set("transparencyNotes", e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
            />
          )}
        </div>
      )}

      <div className={cardClasses("space-y-3 p-5")}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Fiche technique</h2>
          <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
            <Plus size={14} /> Ajouter
          </Button>
        </div>
        {form.specs.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="Stockage"
              value={row.key}
              onChange={(e) => updateSpecRow(i, "key", e.target.value)}
              className={inputClasses}
            />
            <input
              placeholder="128GB"
              value={row.value}
              onChange={(e) => updateSpecRow(i, "value", e.target.value)}
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => removeSpecRow(i)}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className={cardClasses("space-y-3 p-5")}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Variantes (options)</h2>
          <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>
            <Plus size={14} /> Ajouter
          </Button>
        </div>
        {form.variants.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="256GB — Bleu"
              value={row.name}
              onChange={(e) => updateVariantRow(i, "name", e.target.value)}
              className={inputClasses}
            />
            <input
              type="number"
              placeholder="Prix (optionnel)"
              value={row.priceOverride}
              onChange={(e) => updateVariantRow(i, "priceOverride", e.target.value)}
              className={inputClasses}
            />
            <input
              placeholder="SKU (optionnel)"
              value={row.skuOrRef}
              onChange={(e) => updateVariantRow(i, "skuOrRef", e.target.value)}
              className={inputClasses}
            />
            <button
              type="button"
              onClick={() => removeVariantRow(i)}
              className="flex h-11 w-11 flex-none items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : initial ? "Enregistrer" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
