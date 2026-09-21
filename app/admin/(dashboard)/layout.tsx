import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Mail,
  Wrench,
  Ticket,
  Gift,
  LogOut,
} from "lucide-react";
import { logoutAdmin } from "../login/actions";

// Every admin page reads live data (stock, orders, messages...) that staff
// need to see up to date, not a build-time snapshot. Without this, pages
// with no direct dynamic-API usage (cookies/headers/searchParams) get
// statically optimized by default and would serve stale data until the
// next deploy.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/orders", label: "Commandes", icon: ClipboardList },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/repairs", label: "Réparations", icon: Wrench },
  { href: "/admin/promo-codes", label: "Codes promo", icon: Ticket },
  { href: "/admin/bundles", label: "Bundles", icon: Gift },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-60 flex-none flex-col border-r border-black/10 bg-ink text-white">
        <div className="px-5 py-6">
          <Link href="/admin" className="text-lg font-extrabold tracking-tight">
            ELECTRO <span className="text-gold">ZAKI</span>
          </Link>
          <p className="mt-0.5 text-xs text-neutral-400">Administration</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
