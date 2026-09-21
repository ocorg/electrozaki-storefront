"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Upload } from "lucide-react";
import { uploadProductImage } from "@/app/admin/(dashboard)/products/actions";

export function AdminImageUpload({
  currentUrl,
  onUploaded,
}: {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("image", file);
    const result = await uploadProductImage(formData);

    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("idle");
    setPreview(result.url);
    onUploaded(result.url);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="admin-image-upload"
      />
      <label
        htmlFor="admin-image-upload"
        className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 p-4 text-center transition-colors hover:border-gold"
      >
        {preview ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-neutral-50">
            <Image src={preview} alt="Aperçu" fill sizes="96px" className="object-contain p-1" />
          </div>
        ) : (
          <Upload size={26} className="text-neutral-400" />
        )}
        <p className="text-sm font-medium">
          {status === "uploading"
            ? "Envoi en cours..."
            : preview
              ? "Remplacer l'image"
              : "Ajouter une image"}
        </p>
      </label>
      {status === "error" && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {preview && status === "idle" && (
        <p className="mt-2 flex items-center gap-1 text-xs text-green-700">
          <CheckCircle2 size={13} /> Image prête
        </p>
      )}
    </div>
  );
}
