import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderRequestById } from "@/lib/db/order-requests";
import { formatMAD } from "@/lib/format";
import { cardClasses } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusSelect, AdvancePaymentActions } from "./OrderActions";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderRequestById(id);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Commande #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <StatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className={cardClasses("mt-6 p-5")}>
        <h2 className="font-semibold">Client</h2>
        <p className="mt-2 text-sm">{order.customerName}</p>
        <p className="text-sm text-neutral-600">{order.customerPhone}</p>
        {order.deliveryAddress && <p className="mt-1 text-sm text-neutral-600">{order.deliveryAddress}</p>}
        {order.notes && <p className="mt-2 text-sm italic text-neutral-500">&laquo; {order.notes} &raquo;</p>}
      </div>

      <div className={cardClasses("mt-4 p-5")}>
        <h2 className="font-semibold">Articles</h2>
        <ul className="mt-3 divide-y divide-black/5">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.quantity}x {item.productNameSnapshot}
              </span>
              <span className="font-medium">{formatMAD(item.priceAtRequest.toString())}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-black/10 pt-3 text-sm">
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Réduction {order.promoCode ? `(${order.promoCode.code})` : ""}</span>
              <span>-{formatMAD(order.discountAmount.toString())}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMAD(order.totalEstimate.toString())}</span>
          </div>
        </div>
      </div>

      {order.requiresAdvance && (
        <div className={cardClasses("mt-4 p-5")}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Avance de 300 MAD</h2>
            <Badge>{order.advancePaymentStatus}</Badge>
          </div>
          {order.receiptUrl ? (
            <>
              <div className="relative mt-3 h-56 w-full overflow-hidden rounded-lg bg-neutral-50">
                <Image src={order.receiptUrl} alt="Reçu de virement" fill sizes="600px" className="object-contain" />
              </div>
              <AdvancePaymentActions orderId={order.id} />
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">Aucun reçu déposé pour le moment.</p>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-400">
        Reçue le {new Date(order.createdAt).toLocaleString("fr-MA")}
        {order.whatsappOpenedAt && " · WhatsApp ouvert par le client"}
      </p>
    </div>
  );
}
