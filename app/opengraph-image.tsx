import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The card shown when a link to the site is shared (WhatsApp, Facebook…):
// ink + brass, the mark, and what the shop sells, in one look.
export const alt = "Electro Zaki | Téléphones & accessoires à Meknès";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(ellipse 70% 80% at 80% 20%, #4a3510 0%, #111013 60%)",
          color: "white",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 26,
                background: "#1b1a1e",
                border: "2px solid rgba(200,146,42,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} width={60} height={60} alt="" />
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, display: "flex" }}>
              ELECTRO<span style={{ color: "#c8922a", marginLeft: 12 }}>ZAKI</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Téléphones</div>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>& accessoires</div>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3, color: "#e6b555" }}>
              à Meknès.
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#d1c9bb" }}>
            <span>Neufs & d&apos;occasion</span>
            <span style={{ color: "#c8922a" }}>·</span>
            <span>Batterie affichée</span>
            <span style={{ color: "#c8922a" }}>·</span>
            <span>Livraison au Maroc</span>
          </div>
        </div>
        {/* A drawn phone on the right */}
        <div
          style={{
            width: 250,
            height: 486,
            flexShrink: 0,
            marginLeft: 40,
            marginTop: 0,
            borderRadius: 48,
            border: "6px solid #3a3632",
            background: "linear-gradient(180deg,#2a241b,#0b0a09)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 18,
            boxShadow: "0 0 80px rgba(200,146,42,0.35)",
          }}
        >
          <div style={{ width: 80, height: 22, borderRadius: 11, background: "black" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" style={{ marginTop: 70, opacity: 0.9 }} />
          <div
            style={{
              marginTop: "auto",
              width: "100%",
              borderRadius: 18,
              background: "rgba(255,255,255,0.12)",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              fontSize: 16,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.6)" }}>En stock</span>
            <span style={{ fontWeight: 700, fontSize: 20 }}>iPhone · Samsung · Xiaomi</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
