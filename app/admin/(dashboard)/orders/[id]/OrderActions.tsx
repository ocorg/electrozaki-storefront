"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { setOrderStatus, setAdvancePaymentVerified } from "../actions";
import { Button } from "@/components/ui/Button";
import type { OrderRequestStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: OrderRequestStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "CANCELLED"];

export function StatusSelect({ orderId, status }: { orderId: string; status: OrderRequestStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as OrderRequestStatus;
        setValue(next);
        startTransition(() => {
          void setOrderStatus(orderId, next);
        });
      }}
      className="min-h-11 rounded-lg border border-black/15 px-3 text-sm focus:border-gold focus:outline-none"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function AdvancePaymentActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"verified" | "rejected" | null>(null);

  function act(verified: boolean) {
    startTransition(async () => {
      await setAdvancePaymentVerified(orderId, verified);
      setDone(verified ? "verified" : "rejected");
    });
  }

  if (done) {
    return (
      <p className="mt-3 text-sm font-medium text-neutral-600">
        {done === "verified" ? "Marqué comme vérifié." : "Marqué comme rejeté."}
      </p>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button type="button" size="sm" disabled={isPending} onClick={() => act(true)}>
        <Check size={15} /> Vérifier
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => act(false)}>
        <X size={15} /> Rejeter
      </Button>
    </div>
  );
}
