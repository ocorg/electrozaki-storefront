import { listPromoCodes } from "@/lib/db/promo-codes";
import { PromoCodesManager } from "./PromoCodesManager";

export default async function AdminPromoCodesPage() {
  const promoCodes = await listPromoCodes();

  return (
    <div>
      <h1 className="text-2xl font-bold">Codes promo</h1>
      <p className="mt-1 text-neutral-600">
        Codes que les clients peuvent saisir dans le panier pour obtenir une réduction.
      </p>
      <PromoCodesManager
        promoCodes={promoCodes.map((p) => ({
          id: p.id,
          code: p.code,
          type: p.type,
          value: p.value.toString(),
          active: p.active,
          redemptionCount: p.redemptionCount,
          maxRedemptions: p.maxRedemptions,
        }))}
      />
    </div>
  );
}
