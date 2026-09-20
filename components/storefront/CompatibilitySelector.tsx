"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Phone = { id: string; name: string };

type Props = {
  allPhones: Phone[];
  compatiblePhoneIds: string[];
};

export function CompatibilitySelector({ allPhones, compatiblePhoneIds }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const compatibleSet = new Set(compatiblePhoneIds);
  const result = selectedId ? (compatibleSet.has(selectedId) ? "yes" : "unknown") : null;

  return (
    <Card className="mt-4 p-4">
      <p className="text-sm font-semibold">Vérifiez la compatibilité</p>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mt-2 min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
      >
        <option value="">Choisissez votre téléphone</option>
        {allPhones.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {result === "yes" && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          <CheckCircle2 size={16} className="flex-none" />
          Compatible avec votre téléphone
        </p>
      )}
      {/* "unknown" not "no" — no compatibility entry means we haven't
          confirmed the fit for this pair, not that it's confirmed wrong. */}
      {result === "unknown" && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-sm text-neutral-700">
          Compatibilité non confirmée pour ce modèle — écrivez-nous sur{" "}
          <a
            href="https://wa.me/212667654430"
            className="font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>{" "}
          pour vérifier.
        </p>
      )}
    </Card>
  );
}
