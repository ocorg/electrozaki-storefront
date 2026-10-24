import { BellRing, MessageCircle, Store } from "lucide-react";
import { AnchorButton } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { whatsappLink } from "@/lib/site";

// A search that found nothing in stock: say so plainly, offer to be told
// when it arrives (a WhatsApp message, already written), and name the
// closest phones shown below. For accessories, which are sold in the shop
// for now, say where to find them instead.
export function NoExactMatch({
  query,
  closest,
  shopOnly,
  t,
}: {
  query: string;
  /** the shorter search whose results are shown below, if any */
  closest: string | null;
  /** accessories match the search but are sold in the shop only */
  shopOnly: boolean;
  t: Dictionary;
}) {
  const s = t.searchPage;
  return (
    <div className="mb-8 rounded-[1.75rem] border border-dashed border-ink/20 bg-white p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
          {shopOnly ? <Store size={22} aria-hidden /> : <BellRing size={22} aria-hidden />}
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-ink sm:text-2xl">
            {shopOnly ? s.shopOnlyTitle : s.notInStock(query)}
          </p>
          <p className="mt-1.5 text-neutral-600">{shopOnly ? s.shopOnlyText : s.notInStockText}</p>
          <AnchorButton
            href={whatsappLink(shopOnly ? s.waShopOnly(query) : s.waNotify(query))}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            className="mt-4"
          >
            <MessageCircle size={18} aria-hidden /> {shopOnly ? s.askShop : s.notifyMe}
          </AnchorButton>
        </div>
      </div>
      {closest && <p className="mt-6 border-t border-ink/8 pt-5 font-semibold text-ink">{s.closest(closest)}</p>}
    </div>
  );
}
