"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Sparkles } from "lucide-react";
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
const smallInputClasses =
  "min-h-9 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none";

type BoolSelect = "" | "true" | "false";
type SpecRow = { key: string; value: string };

// The 6-field genuine/replaced set is repeated at both the product level
// and per-variant — a shared shape keeps the two forms (and the toBool/
// fromBool conversions) from drifting apart.
type ConditionFields = {
  faceIdWorking: BoolSelect;
  screenGenuine: BoolSelect;
  batteryGenuine: BoolSelect;
  cameraGenuine: BoolSelect;
  chargingPortGenuine: BoolSelect;
  speakerGenuine: BoolSelect;
};

const EMPTY_CONDITION: ConditionFields = {
  faceIdWorking: "",
  screenGenuine: "",
  batteryGenuine: "",
  cameraGenuine: "",
  chargingPortGenuine: "",
  speakerGenuine: "",
};

const CONDITION_FIELD_LABELS: { field: keyof ConditionFields; appleLabel: string; otherLabel: string }[] = [
  { field: "screenGenuine", appleLabel: "Écran d'origine", otherLabel: "Écran d'origine" },
  { field: "batteryGenuine", appleLabel: "Batterie d'origine", otherLabel: "Batterie d'origine" },
  { field: "cameraGenuine", appleLabel: "Caméra d'origine", otherLabel: "Caméra d'origine" },
  { field: "chargingPortGenuine", appleLabel: "Port de charge d'origine", otherLabel: "Port de charge d'origine" },
  { field: "speakerGenuine", appleLabel: "Haut-parleur d'origine", otherLabel: "Haut-parleur d'origine" },
  { field: "faceIdWorking", appleLabel: "Face ID fonctionnel", otherLabel: "Déverrouillage biométrique fonctionnel" },
];

type VariantRow = ConditionFields & {
  name: string;
  priceOverride: string;
  skuOrRef: string;
  color: string;
  storageLabel: string;
  imageUrl: string;
  stockQuantity: string;
  batteryHealthPercent: string;
  hasDefects: boolean;
  transparencyNotes: string;
};

const EMPTY_VARIANT: VariantRow = {
  ...EMPTY_CONDITION,
  name: "",
  priceOverride: "",
  skuOrRef: "",
  color: "",
  storageLabel: "",
  imageUrl: "",
  stockQuantity: "0",
  batteryHealthPercent: "",
  hasDefects: false,
  transparencyNotes: "",
};

export type ProductFormInitial = ConditionFields & {
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
  ...EMPTY_CONDITION,
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

function toBool(v: BoolSelect): boolean | null {
  return v === "" ? null : v === "true";
}

export type CategoryOption = { id: string; name: string; group: string | null };

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInitial>(
    initial ?? { ...EMPTY, id: "", categoryId: categories[0]?.id ?? "" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApple = form.brand.trim().toLowerCase() === "apple";

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
  // Only adds keys that aren't already present, so clicking this twice
  // (or after already filling one in by hand) doesn't create duplicates.
  function addSuggestedSpecs() {
    const existingKeys = new Set(form.specs.map((s) => s.key.trim().toLowerCase()));
    // Storage/RAM are phone-specific — an accessory's spec sheet only ever
    // needs a color, so it doesn't get those two suggested.
    const suggestions = form.isPhone
      ? ["Stockage", "Couleur", ...(isApple ? [] : ["RAM"])]
      : ["Couleur"];
    const newRows = suggestions
      .filter((key) => !existingKeys.has(key.toLowerCase()))
      .map((key) => ({ key, value: "" }));
    if (newRows.length) set("specs", [...form.specs, ...newRows]);
  }

  function addVariantRow() {
    set("variants", [...form.variants, { ...EMPTY_VARIANT }]);
  }
  function updateVariantRow<K extends keyof VariantRow>(index: number, field: K, value: VariantRow[K]) {
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
      cameraGenuine: toBool(form.cameraGenuine),
      chargingPortGenuine: toBool(form.chargingPortGenuine),
      speakerGenuine: toBool(form.speakerGenuine),
      hasDefects: form.hasDefects,
      transparencyNotes: form.transparencyNotes.trim() || null,
      imageUrl: form.imageUrl || null,
      variants: form.variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          skuOrRef: v.skuOrRef.trim() || null,
          color: v.color.trim() || null,
          storageLabel: v.storageLabel.trim() || null,
          imageUrl: v.imageUrl || null,
          stockQuantity: Number(v.stockQuantity) || 0,
          batteryHealthPercent: v.batteryHealthPercent ? Number(v.batteryHealthPercent) : null,
          faceIdWorking: toBool(v.faceIdWorking),
          screenGenuine: toBool(v.screenGenuine),
          batteryGenuine: toBool(v.batteryGenuine),
          cameraGenuine: toBool(v.cameraGenuine),
          chargingPortGenuine: toBool(v.chargingPortGenuine),
          speakerGenuine: toBool(v.speakerGenuine),
          hasDefects: v.hasDefects,
          transparencyNotes: v.transparencyNotes.trim() || null,
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

  // Ungrouped (true top-level leaf categories, e.g. "Téléphones") render as
  // plain options; everything else groups under its parent's <optgroup> —
  // replaces one long flat "Parent > Child" list for every category.
  const ungroupedCategories = categories.filter((c) => !c.group);
  const groupedCategories = categories.reduce<Record<string, CategoryOption[]>>((acc, c) => {
    if (c.group) (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

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
              {ungroupedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {Object.entries(groupedCategories).map(([group, options]) => (
                <optgroup key={group} label={group}>
                  {options.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {form.isPhone && (
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
          )}
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
            onChange={(e) => {
              const isPhone = e.target.checked;
              // Accessories are always sold new — condition/battery/genuine-parts
              // tracking is a used-phone concept, so it's reset rather than left
              // stale when switching a listing over to an accessory.
              setForm((prev) => ({ ...prev, isPhone, condition: isPhone ? prev.condition : "NEUF" }));
            }}
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
              {form.variants.length > 0 && (
                <span className="ml-1 font-normal normal-case text-neutral-400">
                  (ignoré — géré par variante ci-dessous)
                </span>
              )}
            </label>
            <input
              type="number"
              disabled={form.variants.length > 0}
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
              className={`${inputClasses} disabled:bg-neutral-50 disabled:text-neutral-400`}
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
        <AdminImageUpload currentUrl={form.imageUrl} onUploadedAction={(url) => set("imageUrl", url)} />
      </div>

      {form.isPhone && (
        <div className={cardClasses("space-y-4 p-5")}>
          <h2 className="font-semibold">Détails téléphone (valeur générale)</h2>
          {form.variants.length > 0 && (
            <p className="text-xs text-neutral-500">
              Sert de valeur par défaut — chaque variante ci-dessous peut la remplacer pour son
              unité/couleur spécifique.
            </p>
          )}
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
            {CONDITION_FIELD_LABELS.map(({ field, appleLabel, otherLabel }) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {isApple ? appleLabel : otherLabel}
                </label>
                <select
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value as BoolSelect)}
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addSuggestedSpecs}>
              <Sparkles size={14} /> Champs suggérés
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
              <Plus size={14} /> Ajouter
            </Button>
          </div>
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

      <div className={cardClasses("space-y-4 p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Variantes / unités</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Un lot de couleurs/stockages identiques (prix commun) : renseignez couleur, stockage,
              stock et photo. Un lot d&apos;unités reconditionnées (prix différent par unité) :
              ouvrez « État de cette unité » sur chaque ligne. Laissez un champ vide pour hériter de
              la valeur générale ci-dessus.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="flex-none">
            <Plus size={14} /> Ajouter
          </Button>
        </div>

        {form.variants.map((row, i) => (
          <div key={i} className="rounded-xl border border-black/10 p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                placeholder="Nom (ex: 128GB — Bleu)"
                value={row.name}
                onChange={(e) => updateVariantRow(i, "name", e.target.value)}
                className={smallInputClasses}
              />
              <input
                placeholder="Couleur (ex: Bleu)"
                value={row.color}
                onChange={(e) => updateVariantRow(i, "color", e.target.value)}
                className={smallInputClasses}
              />
              {form.isPhone && (
                <input
                  placeholder="Stockage (ex: 128GB)"
                  value={row.storageLabel}
                  onChange={(e) => updateVariantRow(i, "storageLabel", e.target.value)}
                  className={smallInputClasses}
                />
              )}
              <input
                type="number"
                placeholder="Prix (optionnel)"
                value={row.priceOverride}
                onChange={(e) => updateVariantRow(i, "priceOverride", e.target.value)}
                className={smallInputClasses}
              />
              <input
                type="number"
                placeholder="Stock"
                value={row.stockQuantity}
                onChange={(e) => updateVariantRow(i, "stockQuantity", e.target.value)}
                className={smallInputClasses}
              />
              {form.isPhone && (
                <input
                  type="number"
                  placeholder="Batterie (%)"
                  value={row.batteryHealthPercent}
                  onChange={(e) => updateVariantRow(i, "batteryHealthPercent", e.target.value)}
                  className={smallInputClasses}
                />
              )}
              <input
                placeholder="SKU (optionnel)"
                value={row.skuOrRef}
                onChange={(e) => updateVariantRow(i, "skuOrRef", e.target.value)}
                className={smallInputClasses}
              />
            </div>

            <div className="mt-2 flex items-end gap-2">
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Photo de cette variante (optionnel)
                </p>
                <AdminImageUpload
                  currentUrl={row.imageUrl || null}
                  onUploadedAction={(url) => updateVariantRow(i, "imageUrl", url)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariantRow(i)}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {form.isPhone && (
              <details className="mt-3 rounded-lg bg-neutral-50 p-3">
                <summary className="cursor-pointer text-sm font-medium">État de cette unité</summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {CONDITION_FIELD_LABELS.map(({ field, appleLabel, otherLabel }) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs text-neutral-500">
                        {isApple ? appleLabel : otherLabel}
                      </label>
                      <select
                        value={row[field]}
                        onChange={(e) => updateVariantRow(i, field, e.target.value as BoolSelect)}
                        className={smallInputClasses}
                      >
                        <option value="">Hérite</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </div>
                  ))}
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.hasDefects}
                    onChange={(e) => updateVariantRow(i, "hasDefects", e.target.checked)}
                    className="h-4 w-4"
                  />
                  Cette unité a des défauts à signaler
                </label>
                {row.hasDefects && (
                  <textarea
                    rows={2}
                    placeholder="Décrivez le défaut de cette unité précise"
                    value={row.transparencyNotes}
                    onChange={(e) => updateVariantRow(i, "transparencyNotes", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                )}
              </details>
            )}
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
