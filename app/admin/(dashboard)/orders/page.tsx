import Link from "next/link";
import { listOrderRequests } from "@/lib/db/order-requests";
import { formatMAD } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { OrderRequestStatus } from "@/generated/prisma/enums";

const STATUSES: { value: OrderRequestStatus | undefined; label: string }[] = [
  { value: undefined, label: "Toutes" },
  { value: "NEW", label: "Nouvelles" },
  { value: "CONTACTED", label: "Contactées" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "CANCELLED", label: "Annulées" },
];

const STATUS_TONE: Record<OrderRequestStatus, BadgeTone> = {
  NEW: "gold",
  CONTACTED: "neutral",
  CONFIRMED: "success",
  CANCELLED: "neutral",
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const orders = await listOrderRequests(status as OrderRequestStatus | undefined);

  return (
    <div>
      <h1 className="text-2xl font-bold">Commandes</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.label}
            href={s.value ? `/admin/orders?status=${s.value}` : "/admin/orders"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              status === s.value || (!status && !s.value)
                ? "bg-ink text-white"
                : "bg-black/5 text-neutral-600 hover:bg-black/10"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Articles</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Avance</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-ink hover:underline">
                    {order.customerName}
                  </Link>
                  <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">{order.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatMAD(order.totalEstimate.toString())}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {order.requiresAdvance ? order.advancePaymentStatus : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("fr-MA")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Aucune commande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
