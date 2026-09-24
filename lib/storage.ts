import { createHmac, timingSafeEqual } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// Cloudflare R2 is S3-compatible, so the AWS SDK works unmodified against
// it — just point the endpoint at the account's R2 URL.
//
// Payment receipts go to a PRIVATE bucket (R2_RECEIPTS_BUCKET, no public
// access): a bank receipt must never be reachable by URL. Staff view them
// from the ERP through short-lived signed links. Product photos are
// uploaded by the ERP straight to the public storefront bucket, so this app
// no longer writes there at all.
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const MAX_BYTES = 5 * 1024 * 1024;

// A bank receipt needs to stay legible, so it keeps a fair amount of
// resolution and a high quality floor.
const RECEIPT_PRESET = { maxDimension: 1600, quality: 85 };

export type UploadReceiptResult =
  | { ok: true; key: string; token: string }
  | { ok: false; error: string };

function sign(key: string): string {
  const secret = process.env.RECEIPT_SIGNING_SECRET;
  if (!secret) throw new Error("RECEIPT_SIGNING_SECRET is not set");
  return createHmac("sha256", secret).update(`receipt:${key}`).digest("base64url");
}

// True only for a key this server stored and signed — the order form can't
// attach an arbitrary link or someone else's receipt.
export function verifyReceiptToken(key: string, token: string): boolean {
  if (!/^receipts\/[\w-]+\.(webp|pdf)$/.test(key)) return false;
  const expected = Buffer.from(sign(key));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// Images are re-encoded to WebP (which also rejects anything that isn't
// really an image, whatever its declared type); PDFs (bank-app transfer
// receipts) are kept as they are, once their content is checked to really
// be a PDF. Both go to the private bucket.
export async function uploadReceiptImage(file: File): Promise<UploadReceiptResult> {
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Fichier trop volumineux (5 Mo maximum)." };
  }
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf && !file.type.startsWith("image/")) {
    return { ok: false, error: "Le reçu doit être une photo (JPG, PNG) ou un PDF." };
  }

  const bucket = process.env.R2_RECEIPTS_BUCKET;
  if (!bucket || !process.env.R2_ACCOUNT_ID) {
    return { ok: false, error: "Le stockage des reçus n'est pas configuré." };
  }

  if (isPdf) {
    const buffer = Buffer.from(await file.arrayBuffer());
    // The declared type proves nothing: a real PDF starts with "%PDF-".
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return { ok: false, error: "Ce fichier n'est pas un PDF valide." };
    }
    return store(bucket, buffer, "pdf", "application/pdf");
  }

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({
        width: RECEIPT_PRESET.maxDimension,
        height: RECEIPT_PRESET.maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: RECEIPT_PRESET.quality })
      .toBuffer();
  } catch {
    return { ok: false, error: "Image illisible. Essayez une photo JPG ou PNG, ou le PDF du virement." };
  }
  return store(bucket, outputBuffer, "webp", "image/webp");
}

async function store(bucket: string, body: Buffer, ext: "webp" | "pdf", contentType: string): Promise<UploadReceiptResult> {
  try {
    const key = `receipts/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    await r2Client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    return { ok: true, key, token: sign(key) };
  } catch {
    return { ok: false, error: "Échec de l'envoi du reçu. Réessayez." };
  }
}
