"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ImageOff } from "lucide-react";
import { formatMAD } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

type Row = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  categoryName: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  availability: string;
  condition: string;
};

export function ProductSearchFilter({
  products,
  availabilityLabels,
  conditionLabels,
}: {
  products: Row[];
  availabilityLabels: Record<string, string>;
  conditionLabels: Record<string, string>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="mt-6">
      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          placeholder="Rechercher par nom ou marque..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 py-2 pl-9 pr-3 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3">Disponibilité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-neutral-50">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill sizes="40px" className="object-contain p-1" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-300">
                          <ImageOff size={14} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.brand && <p className="text-xs text-neutral-500">{p.brand}</p>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.categoryName}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">{formatMAD(p.price)}</span>
                  {p.compareAtPrice && (
                    <span className="ml-1.5 text-xs text-neutral-400 line-through">
                      {formatMAD(p.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 3 ? "font-semibold text-red-600" : ""}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{conditionLabels[p.condition] ?? p.condition}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.availability === "IN_STOCK" ? "success" : "neutral"}>
                    {availabilityLabels[p.availability] ?? p.availability}
                  </Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Aucun produit ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
