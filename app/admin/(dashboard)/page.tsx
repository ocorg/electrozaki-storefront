import Link from "next/link";
import { ClipboardList, Mail, Wrench, PackageX } from "lucide-react";
import { countNewOrderRequests } from "@/lib/db/order-requests";
import { countRecentContactMessages } from "@/lib/db/contact";
import { countOpenRepairRequests } from "@/lib/db/repair";
import { countLowStockProducts } from "@/lib/db/admin-products";
import { cardClasses } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const [newOrders, recentMessages, openRepairs, lowStock] = await Promise.all([
    countNewOrderRequests(),
    countRecentContactMessages(),
    countOpenRepairRequests(),
    countLowStockProducts(),
  ]);

  const cards = [
    {
      label: "Nouvelles commandes",
      value: newOrders,
      href: "/admin/orders",
      icon: ClipboardList,
    },
    {
      label: "Messages (7 derniers jours)",
      value: recentMessages,
      href: "/admin/messages",
      icon: Mail,
    },
    {
      label: "Réparations en attente",
      value: openRepairs,
      href: "/admin/repairs",
      icon: Wrench,
    },
    {
      label: "Produits en stock faible",
      value: lowStock,
      href: "/admin/products",
      icon: PackageX,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <p className="mt-1 text-neutral-600">Aperçu rapide de l&apos;activité du site.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className={cardClasses("block p-5 transition-shadow hover:shadow-md")}>
            <card.icon size={20} className="text-gold" />
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-sm text-neutral-600">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
