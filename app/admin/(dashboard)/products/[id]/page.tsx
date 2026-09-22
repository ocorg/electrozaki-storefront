import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getAdminProductById } from "@/lib/db/admin-products";
import { listAdminCategories } from "@/lib/db/categories";
import { ProductForm, type ProductFormInitial } from "@/components/admin/ProductForm";
import { removeProduct } from "../actions";

type Props = { params: Promise<{ id: string }> };

function boolToSelect(v: boolean | null): "" | "true" | "false" {
  return v === null ? "" : v ? "true" : "false";
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    listAdminCategories(),
  ]);
  if (!product) notFound();

  const options = categories
    .filter((c) => c._count.children === 0 || c.id === product.categoryId)
    .map((c) => ({ id: c.id, name: c.name, group: c.parent?.name ?? null }));

  const specs = (product.specs ?? {}) as Record<string, string>;

  const initial: ProductFormInitial = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? "",
    categoryId: product.categoryId,
    condition: product.condition,
    isPhone: product.isPhone,
    description: product.description ?? "",
    specs: Object.entries(specs).map(([key, value]) => ({ key, value })),
    recommendedSalePrice: product.recommendedSalePrice.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? "",
    availability: product.availability,
    tags: product.tags.join(", "),
    batteryHealthPercent: product.batteryHealthPercent?.toString() ?? "",
    faceIdWorking: boolToSelect(product.faceIdWorking),
    screenGenuine: boolToSelect(product.screenGenuine),
    batteryGenuine: boolToSelect(product.batteryGenuine),
    cameraGenuine: boolToSelect(product.cameraGenuine),
    chargingPortGenuine: boolToSelect(product.chargingPortGenuine),
    speakerGenuine: boolToSelect(product.speakerGenuine),
    hasDefects: product.hasDefects,
    transparencyNotes: product.transparencyNotes ?? "",
    imageUrl: product.images[0]?.url ?? "",
    variants: product.variants.map((v) => ({
      name: v.name,
      priceOverride: v.priceOverride?.toString() ?? "",
      skuOrRef: v.skuOrRef ?? "",
      color: v.color ?? "",
      storageLabel: v.storageLabel ?? "",
      imageUrl: v.imageUrl ?? "",
      stockQuantity: v.stockQuantity.toString(),
      batteryHealthPercent: v.batteryHealthPercent?.toString() ?? "",
      faceIdWorking: boolToSelect(v.faceIdWorking),
      screenGenuine: boolToSelect(v.screenGenuine),
      batteryGenuine: boolToSelect(v.batteryGenuine),
      cameraGenuine: boolToSelect(v.cameraGenuine),
      chargingPortGenuine: boolToSelect(v.chargingPortGenuine),
      speakerGenuine: boolToSelect(v.speakerGenuine),
      hasDefects: v.hasDefects,
      transparencyNotes: v.transparencyNotes ?? "",
    })),
    purchasePrice: product.internal?.purchasePrice.toString() ?? "",
    minSalePrice: product.internal?.minSalePrice.toString() ?? "",
    stockQuantity: product.internal?.stockQuantity.toString() ?? "0",
    supplier: product.internal?.supplier ?? "",
    sourceNote: product.internal?.sourceNote ?? "",
    internalNotes: product.internal?.internalNotes ?? "",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Modifier {product.name}</h1>
        <form
          action={async () => {
            "use server";
            await removeProduct(product.id);
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 size={15} /> Supprimer
          </button>
        </form>
      </div>
      <div className="mt-6 max-w-3xl">
        <ProductForm categories={options} initial={initial} />
      </div>
    </div>
  );
}
