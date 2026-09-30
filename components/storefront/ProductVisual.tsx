import Image from "next/image";
import { artFor } from "@/lib/category-art";
import { DeviceArt } from "@/components/storefront/DeviceArt";

// The product's photo — or, when the ERP has none yet (most accessories),
// a drawn stand-in that still says what it is: a phone shows its model
// name on its screen, an accessory its line drawing and key spec ("20W",
// "USB-C", "30K") read from the name.

const SPEC_PATTERNS: RegExp[] = [
  /\b\d{2,3}\s?W\b/i,
  /\b\d{1,2}\s?K\b/,
  /\b\d+(?:GB|TB)\b/i,
  /\bUSB[-\s]?C\b|\bType[-\s]?C\b/i,
  /\bLightning\b/i,
  /\b[UC]-[CLM]\b/,
  /\bMagSafe\b/i,
];

function specsOf(name: string): string[] {
  const out: string[] = [];
  for (const re of SPEC_PATTERNS) {
    const m = name.match(re);
    if (m && !out.includes(m[0].toUpperCase())) out.push(m[0].toUpperCase().replace(/\s/g, ""));
    if (out.length === 2) break;
  }
  return out;
}

type Props = {
  image?: { url: string; altText?: string | null } | null;
  name: string;
  brand?: string | null;
  categorySlug?: string | null;
  isPhone?: boolean;
  sizes: string;
  priority?: boolean;
  size?: "card" | "large";
  className?: string;
};

export function ProductVisual({
  image,
  name,
  brand,
  categorySlug,
  isPhone,
  sizes,
  priority,
  size = "card",
  className = "",
}: Props) {
  if (image) {
    return (
      <div className={`relative h-full w-full bg-white ${className}`}>
        <Image
          src={image.url}
          alt={image.altText ?? name}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain transition-transform duration-700 ease-out-quint group-hover:scale-[1.04] ${size === "large" ? "p-6 sm:p-10" : "p-3"}`}
        />
      </div>
    );
  }

  const large = size === "large";

  if (isPhone) {
    // A drawn phone with the model on its screen.
    const storage = name.match(/\b\d+(?:GB|TB)\b/i)?.[0];
    const model = storage ? name.replace(storage, "").trim() : name;
    return (
      <div
        role="img"
        aria-label={name}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-paper to-paper-2 ${className}`}
      >
        <div
          className={`relative flex flex-col rounded-[1.6em] border-[0.35em] border-ink bg-ink-2 shadow-[0_18px_40px_-18px_rgb(17_16_19/0.6)] transition-transform duration-700 ease-out-quint group-hover:-translate-y-1 group-hover:rotate-[-2deg] ${
            large ? "h-[78%] text-[20px]" : "h-[80%] text-[10px] sm:text-[11px]"
          } aspect-9/19`}
        >
          <span className="mx-auto mt-[0.6em] h-[0.9em] w-[3.2em] rounded-full bg-black" />
          <span className="mt-auto px-[0.8em] pb-[1.4em] text-left">
            {brand && <span className="block font-mono text-[0.8em] uppercase tracking-widest text-gold">{brand}</span>}
            <span className="mt-[0.2em] block font-display text-[1.25em] font-bold leading-[1.05] text-white">{model}</span>
            {storage && <span className="mt-[0.5em] inline-block rounded-full bg-white/10 px-[0.6em] py-[0.15em] font-mono text-[0.8em] text-neutral-200">{storage.toUpperCase()}</span>}
          </span>
        </div>
      </div>
    );
  }

  const specs = specsOf(name);
  return (
    <div
      role="img"
      aria-label={name}
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#fff_0%,var(--color-paper)_70%)] ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(17_16_19/0.07)_1px,transparent_1px)] [background-size:14px_14px]"
      />
      <DeviceArt
        kind={artFor(categorySlug, name)}
        className={`relative text-ink/85 transition-transform duration-700 ease-out-quint [--art-accent:var(--color-gold)] group-hover:-translate-y-1 group-hover:scale-105 ${
          large ? "w-2/5" : "w-1/2"
        }`}
      />
      {specs.length > 0 && (
        <span className={`relative flex gap-1.5 ${large ? "mt-6" : "mt-2"}`}>
          {specs.map((s) => (
            <span
              key={s}
              className={`rounded-full border border-ink/10 bg-white font-mono font-semibold text-ink ${large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]"}`}
            >
              {s}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
