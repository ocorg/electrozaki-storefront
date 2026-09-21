"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { savePromoCode, removePromoCode } from "./actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cardClasses } from "@/components/ui/Card";

type PromoRow = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string;
  active: boolean;
  redemptionCount: number;
  maxRedemptions: number | null;
};

const inputClasses =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

const EMPTY_FORM = {
  code: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
  value: "",
  active: true,
  startsAt: "",
  expiresAt: "",
  maxRedemptions: "",
  minOrderAmount: "",
};

export function PromoCodesManager({ promoCodes }: { promoCodes: PromoRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await savePromoCode(null, {
      code: form.code,
      type: form.type,
      value: Number(form.value) || 0,
      active: form.active,
      startsAt: form.startsAt ? new Date(form.startsAt) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(EMPTY_FORM);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await removePromoCode(id);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleCreate} className={cardClasses("space-y-4 p-5")}>
        <h2 className="font-semibold">Nouveau code promo</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            required
            placeholder="Code (ex: BIENVENUE10)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className={inputClasses}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT" })}
            className={inputClasses}
          >
            <option value="PERCENTAGE">Pourcentage (%)</option>
            <option value="FIXED_AMOUNT">Montant fixe (MAD)</option>
          </select>
          <input
            type="number"
            required
            placeholder={form.type === "PERCENTAGE" ? "Ex: 10 (pour 10%)" : "Ex: 50 (MAD)"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className={inputClasses}
          />
          <input
            type="date"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            className={inputClasses}
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className={inputClasses}
          />
          <input
            type="number"
            placeholder="Nb max d'utilisations (optionnel)"
            value={form.maxRedemptions}
            onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
            className={inputClasses}
          />
          <input
            type="number"
            placeholder="Panier minimum en MAD (optionnel)"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
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
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Réduction</th>
              <th className="px-4 py-3">Utilisations</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {promoCodes.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono font-medium">{p.code}</td>
                <td className="px-4 py-3">
                  {p.type === "PERCENTAGE" ? `${p.value}%` : `${p.value} MAD`}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {p.redemptionCount}
                  {p.maxRedemptions ? ` / ${p.maxRedemptions}` : ""}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Actif" : "Inactif"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Aucun code promo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
