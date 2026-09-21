import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// Cloudflare R2 is S3-compatible, so the AWS SDK works unmodified against
// it — just point the endpoint at the account's R2 URL. See README/setup
// notes for the one-time bucket + API token creation in the Cloudflare
// dashboard; the env vars below are not optional at runtime.
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

type ProcessOptions = {
  maxDimension: number;
  quality: number;
};

// Presets tuned for what each upload actually needs: product photos are
// displayed small (this site has no zoom feature) and benefit from being
// squeezed hard; a bank receipt needs to stay legible, so it keeps more
// resolution and a higher quality floor.
export const IMAGE_PRESETS = {
  product: { maxDimension: 1200, quality: 80 } satisfies ProcessOptions,
  receipt: { maxDimension: 1600, quality: 85 } satisfies ProcessOptions,
};

export type UploadImageResult = { ok: true; url: string } | { ok: false; error: string };

// Resizes (never upscales, never crops — `fit: "inside"` preserves the
// original aspect ratio) to WebP at the given preset, then uploads to R2.
// The product/collection UI already displays images with `object-contain`
// inside a square box, so a non-square source just letterboxes cleanly —
// no need to force-crop uploads into a hard square here.
export async function uploadImage(
  file: File,
  folder: "products" | "receipts",
  preset: ProcessOptions
): Promise<UploadImageResult> {
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Fichier trop volumineux (8 Mo maximum)." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Le fichier doit être une image." };
  }

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!bucket || !publicUrl || !process.env.R2_ACCOUNT_ID) {
    return { ok: false, error: "Le stockage d'images n'est pas configuré (variables R2 manquantes)." };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const outputBuffer = await sharp(inputBuffer)
      .resize({
        width: preset.maxDimension,
        height: preset.maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: preset.quality })
      .toBuffer();

    const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.webp`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: outputBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return { ok: true, url: `${publicUrl.replace(/\/$/, "")}/${key}` };
  } catch {
    return { ok: false, error: "Échec de l'envoi de l'image. Réessayez." };
  }
}
