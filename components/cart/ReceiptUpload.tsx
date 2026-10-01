"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { uploadReceipt } from "@/app/[lang]/(storefront)/cart/actions";
import { compressImage } from "@/lib/compress-image";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

// The private object key plus the server's signature over it — the order
// action only accepts a receipt it can prove this server stored.
export type UploadedReceipt = { key: string; token: string };

type Props = {
  onUploadedAction: (receipt: UploadedReceipt) => void;
};

export function ReceiptUpload({ onUploadedAction }: Props) {
  const t = useT();
  const r = t.receipt;
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    let result: Awaited<ReturnType<typeof uploadReceipt>>;
    try {
      const formData = new FormData();
      formData.set("receipt", await compressImage(file));
      result = await uploadReceipt(formData);
    } catch {
      result = { ok: false, error: r.failed };
    }

    if (!result.ok) {
      setStatus("error");
      setError(translateError(t, result.error));
      return;
    }

    setStatus("done");
    onUploadedAction({ key: result.key, token: result.token });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.pdf"
        onChange={handleChange}
        className="hidden"
        id="receipt-upload"
      />
      <label
        htmlFor="receipt-upload"
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          status === "done"
            ? "border-green-400 bg-green-50"
            : "border-black/20 hover:border-gold"
        }`}
      >
        {status === "done" ? (
          <>
            <CheckCircle2 size={30} className="text-green-600" />
            <p className="mt-2 text-sm font-medium text-green-700">{r.done}</p>
            <p className="mt-1 text-xs text-neutral-500">{r.replace}</p>
          </>
        ) : status === "uploading" ? (
          <p className="text-sm text-neutral-500">{r.uploading}</p>
        ) : (
          <>
            <Upload size={30} className="text-neutral-400" />
            <p className="mt-2 text-sm font-medium">
              {r.drop}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{r.formats}</p>
          </>
        )}
      </label>

      {status === "error" && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
