"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveBundle, removeBundle } from "./actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cardClasses } from "@/components/ui/Card";
import { formatMAD } from "@/lib/format";

type ProductOption = { id: string; name: string; price: number };

type BundleRow = {
  id: string;
  name: string;
  slug: string;
  bundlePrice: string;
  active: boolean;
  items: { productName: string; quantity: number }[];
};

const inputClasses =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

type ItemRow = { productId: string; quantity: string };

export function BundlesManager({
  bundles,
  products,
}: {
  bundles: BundleRow[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { productId: products[0]?.id ?? "", quantity: "1" },
    { productId: products[1]?.id ?? "", quantity: "1" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * (Number(item.quantity) || 0);
  }, 0);

  function addItemRow() {
    setItems([...items, { productId: products[0]?.id ?? "", quantity: "1" }]);
  }
  function updateItemRow(index: number, field: keyof ItemRow, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  }
  function removeItemRow(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await saveBundle(null, {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      bundlePrice: Number(bundlePrice) || 0,
      active: true,
      items: items
        .filter((i) => i.productId)
        .map((i) => ({ productId: i.productId, quantity: Number(i.quantity) || 1 })),
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSlug("");
    setDescription("");
    setBundlePrice("");
    setItems([
      { productId: products[0]?.id ?? "", quantity: "1" },
      { productId: products[1]?.id ?? "", quantity: "1" },
    ]);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await removeBundle(id);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleCreate} className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Nouveau bundle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Nom (ex: Pack rentrée iPhone 13)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
          <input
            required
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClasses}
          />
        </div>
        <textarea
          rows={2}
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Produits du pack
          </p>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={item.productId}
                onChange={(e) => updateItemRow(i, "productId", e.target.value)}
                className={inputClasses}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatMAD(p.price)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItemRow(i, "quantity", e.target.value)}
                className="min-h-11 w-24 rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeItemRow(i)}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
            <Plus size={14} /> Ajouter un produit
          </Button>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Prix du pack (MAD)
            </label>
            <input
              type="number"
              required
              value={bundlePrice}
              onChange={(e) => setBundlePrice(e.target.value)}
              className={inputClasses}
            />
          </div>
          {normalTotal > 0 && (
            <p className="pb-3 text-sm text-neutral-500">
              Prix normal cumulé : <span className="line-through">{formatMAD(normalTotal)}</span>
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Création..." : "Créer le bundle"}
        </Button>
      </form>

      <div className="space-y-3">
        {bundles.map((b) => (
          <div key={b.id} className={cardClasses("flex items-center justify-between p-4")}>
            <div>
              <p className="flex items-center gap-2 font-medium">
                {b.name}
                <Badge tone={b.active ? "success" : "neutral"}>{b.active ? "Actif" : "Inactif"}</Badge>
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {b.items.map((i) => `${i.quantity}x ${i.productName}`).join(" + ")} —{" "}
                {formatMAD(b.bundlePrice)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(b.id)}
              className="inline-flex items-center gap-1 text-red-600 hover:underline"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        ))}
        {bundles.length === 0 && <p className="py-8 text-center text-neutral-500">Aucun bundle.</p>}
      </div>
    </div>
  );
}
