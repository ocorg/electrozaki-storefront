import Link from "next/link";
import Image from "next/image";
import { formatMAD } from "@/lib/format";
import type { PublicProduct } from "@/lib/db/public-products";

export function ProductCard({ product }: { product: PublicProduct }) {
  const cover = product.images[0];
  const isSoldOut =
    product.availability === "OUT_OF_STOCK" || product.availability === "DISCONTINUED";
  const isComingSoon = product.availability === "COMING_SOON";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-black/10 transition-colors hover:border-[#c8922a]"
    >
      <div className="relative aspect-square bg-neutral-50">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? product.name}
            fill
            className="object-contain p-4"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Image à venir
          </div>
        )}
        {(isSoldOut || isComingSoon) && (
          <span className="absolute left-2 top-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
            {isComingSoon ? "Bientôt disponible" : "Épuisé"}
          </span>
        )}
      </div>
      <div className="p-3">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
        )}
        <h3 className="font-medium leading-snug">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-[#c8922a]">
            {formatMAD(product.recommendedSalePrice.toString())}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-neutral-400 line-through">
              {formatMAD(product.compareAtPrice.toString())}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
