"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveCategory, removeCategory } from "./actions";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCount: number;
};

const inputClasses =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

export function CategoriesManager({
  categories,
  topLevel,
}: {
  categories: CategoryRow[];
  topLevel: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await saveCategory(null, {
      name: name.trim(),
      slug: slug.trim(),
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setSlug("");
    setParentId("");
    setSortOrder("0");
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const result = await removeCategory(id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleCreate} className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Nouvelle catégorie</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <input
            required
            placeholder="Nom"
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
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClasses}>
            <option value="">Catégorie principale (sans parent)</option>
            {topLevel.map((c) => (
              <option key={c.id} value={c.id}>
                Sous-catégorie de {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Ordre d'affichage"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputClasses}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting}>
          <Plus size={16} /> {submitting ? "Création..." : "Créer"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Produits</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-500">{c.slug}</td>
                <td className="px-4 py-3 text-neutral-600">{c.parentName ?? "—"}</td>
                <td className="px-4 py-3">{c.productCount}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline disabled:opacity-40"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
