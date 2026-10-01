"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { WHATSAPP_URL } from "@/lib/site";
import { useT } from "@/components/i18n/I18nProvider";

type Phone = { id: string; name: string };

type Props = {
  allPhones: Phone[];
  compatiblePhoneIds: string[];
};

export function CompatibilitySelector({ allPhones, compatiblePhoneIds }: Props) {
  const { compat } = useT();
  const [selectedId, setSelectedId] = useState("");
  const compatibleSet = new Set(compatiblePhoneIds);
  const result = selectedId ? (compatibleSet.has(selectedId) ? "yes" : "unknown") : null;

  return (
    <Card className="mt-4 p-4">
      <p className="text-sm font-semibold">{compat.title}</p>
      <Select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mt-2 min-h-11 w-full rounded-lg border border-black/15 px-2 text-sm focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        <option value="">{compat.choose}</option>
        {allPhones.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      {result === "yes" && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          <CheckCircle2 size={16} className="flex-none" />
          {compat.yes}
        </p>
      )}
      {/* "unknown" not "no" — no compatibility entry means we haven't
          confirmed the fit for this pair, not that it's confirmed wrong. */}
      {result === "unknown" && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-sm text-neutral-700">
          {compat.unknownBefore}{" "}
          <a
            href={WHATSAPP_URL}
            className="font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>{" "}
          {compat.unknownAfter}
        </p>
      )}
    </Card>
  );
}
