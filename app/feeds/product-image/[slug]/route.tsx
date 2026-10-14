import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/db/public-products";

// A square picture for a product the ERP has no photo for yet, so Meta's
// catalogue (which refuses items without an image) still takes it: the
// product's name on the shop's ink and brass. Replaced by the real photo as
// soon as staff add one. No price on it: prices change, pictures stay cached.
export const revalidate = 86400;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return new Response(null, { status: 404 });

  const logo = await readFile(join(process.cwd(), "public", "logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const name = product.name.length > 60 ? `${product.name.slice(0, 58)}…` : product.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "radial-gradient(ellipse 80% 70% at 75% 15%, #4a3510 0%, #111013 62%)",
          color: "white",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={56} height={56} alt="" />
          <div style={{ fontSize: 30, fontWeight: 800, display: "flex" }}>
            ELECTRO<span style={{ color: "#c8922a", marginLeft: 10 }}>ZAKI</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 26, color: "#e6b555", textTransform: "uppercase", letterSpacing: 4 }}>{product.category.name}</div>
          <div style={{ fontSize: name.length > 30 ? 64 : 80, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{name}</div>
        </div>
        <div style={{ fontSize: 26, color: "#d1c9bb" }}>Meknès · Livraison partout au Maroc</div>
      </div>
    ),
    { width: 800, height: 800 }
  );
}
