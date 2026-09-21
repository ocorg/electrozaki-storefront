"use client";

import { useState, useTransition } from "react";
import { setRepairStatus } from "./actions";
import type { RepairRequestStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: RepairRequestStatus[] = ["NEW", "CONTACTED", "QUOTED", "CONFIRMED", "CANCELLED"];

export function RepairStatusSelect({ id, status }: { id: string; status: RepairRequestStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as RepairRequestStatus;
        setValue(next);
        startTransition(() => {
          void setRepairStatus(id, next);
        });
      }}
      className="min-h-9 rounded-lg border border-black/15 px-2 text-sm focus:border-gold focus:outline-none"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
