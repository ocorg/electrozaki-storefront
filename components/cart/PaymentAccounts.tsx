"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { PAYMENT_ACCOUNTS } from "@/lib/payment-accounts";

/**
 * The accounts the reservation advance can be sent to, one card each, with a
 * copy button per number so nobody retypes a 24-digit RIB on a phone.
 */
export function PaymentAccounts() {
  const t = useT();
  const c = t.cartPage;
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, value: string) {
    try {
      // Banking apps want the digits alone.
      await navigator.clipboard.writeText(value.replace(/\s+/g, ""));
      setCopied(id);
      setTimeout(() => setCopied((cur) => (cur === id ? null : cur)), 2000);
    } catch {
      // clipboard blocked: the number stays selectable on screen
    }
  }

  return (
    <ul className="mt-3 space-y-2">
      {PAYMENT_ACCOUNTS.map((account) => (
        <li key={account.key} className="rounded-lg bg-white p-3 text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-24 flex-none items-center justify-center">
              <Image
                src={account.logo.src}
                alt={account.name}
                width={account.logo.width}
                height={account.logo.height}
                className="max-h-10 w-auto object-contain"
              />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{account.name}</p>
              {account.holder && (
                <p className="text-xs text-neutral-600">
                  {c.holder} : {account.holder}
                </p>
              )}
            </div>
          </div>
          <dl className="mt-2 space-y-1">
            {account.details.map((d) => {
              const id = `${account.key}-${d.label}`;
              const done = copied === id;
              return (
                <div key={id} className="flex items-center justify-between gap-2 rounded-md bg-paper px-2.5 py-1.5">
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {d.label}
                    </dt>
                    <dd dir="ltr" className="readout select-all break-words text-[13px] font-semibold text-ink">
                      {d.value}
                    </dd>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(id, d.value)}
                    aria-label={`${c.copy} ${d.label} ${account.name}`}
                    className={`flex min-h-10 flex-none items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
                      done ? "bg-signal text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                    }`}
                  >
                    {done ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                    <span aria-live="polite">{done ? c.copied : c.copy}</span>
                  </button>
                </div>
              );
            })}
          </dl>
        </li>
      ))}
    </ul>
  );
}
