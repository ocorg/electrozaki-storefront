"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { uploadReceipt } from "@/app/(storefront)/cart/actions";

type Props = {
  onUploadedAction: (url: string) => void;
};

export function ReceiptUpload({ onUploadedAction }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("receipt", file);
    const result = await uploadReceipt(formData);

    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("done");
    onUploadedAction(result.url);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
            <p className="mt-2 text-sm font-medium text-green-700">Reçu envoyé avec succès</p>
            <p className="mt-1 text-xs text-neutral-500">Appuyez pour remplacer le fichier</p>
          </>
        ) : status === "uploading" ? (
          <p className="text-sm text-neutral-500">Envoi en cours...</p>
        ) : (
          <>
            <Upload size={30} className="text-neutral-400" />
            <p className="mt-2 text-sm font-medium">
              Déposez votre reçu ou appuyez pour prendre une photo
            </p>
            <p className="mt-1 text-xs text-neutral-500">JPG, PNG — 5 Mo maximum</p>
          </>
        )}
      </label>

      {status === "error" && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
