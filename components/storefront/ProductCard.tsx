import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatMAD, discountPercent } from "@/lib/format";
import { CONDITION_LABEL } from "@/lib/conditions";
import type { PublicProduct } from "@/lib/db/public-products";
import { interactiveCardClasses } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: PublicProduct }) {
  const cover = product.images[0];
  const isSoldOut =
    product.availability === "OUT_OF_STOCK" || product.availability === "DISCONTINUED";
  const isComingSoon = product.availability === "COMING_SOON";
  const percentOff = discountPercent(
    product.recommendedSalePrice.toString(),
    product.compareAtPrice?.toString()
  );

  return (
    <Link href={`/products/${product.slug}`} className={interactiveCardClasses("group block overflow-hidden")}>
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
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-neutral-400">
            <ImageOff size={22} />
            <span className="text-xs">Image à venir</span>
          </div>
        )}
        {(isSoldOut || isComingSoon) && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-xs font-medium text-white">
            {isComingSoon ? "Bientôt disponible" : "Épuisé"}
          </span>
        )}
        {percentOff !== null && (
          <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
            -{percentOff}%
          </span>
        )}
      </div>
      <div className="p-3">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
        )}
        <h3 className="font-medium leading-snug text-neutral-900">{product.name}</h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="rounded-lg bg-ink px-2 py-1 text-sm font-bold text-gold">
            {formatMAD(product.recommendedSalePrice.toString())}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-neutral-500 line-through">
              {formatMAD(product.compareAtPrice.toString())}
            </span>
          )}
        </div>
        <Badge className="mt-2">{CONDITION_LABEL[product.condition] ?? product.condition}</Badge>
      </div>
    </Link>
  );
}
