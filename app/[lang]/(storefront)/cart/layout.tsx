import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getT } from "@/lib/i18n/server";

// The page itself runs in the browser, so its tab title is set here.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.common.cart, robots: { index: false, follow: true } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
