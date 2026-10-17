import type { Metadata } from "next";
import { getT } from "@/lib/i18n/server";
import { OrderTrackingForm } from "./OrderTrackingForm";

export async function generateMetadata(): Promise<Metadata> {
  const { orderTracking } = await getT();
  return { title: orderTracking.metaTitle, description: orderTracking.metaDescription, robots: { index: false } };
}

type Props = { searchParams: Promise<{ ref?: string }> };

// A website order's progress: the customer types the reference shown after
// ordering (or arrives with ?ref= from the confirmation) and their phone.
export default async function OrderTrackingPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const initialRef = typeof ref === "string" && /^[A-Za-z0-9]{8}$/.test(ref) ? ref.toUpperCase() : "";
  const t = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t.orderTracking.title}</h1>
      <p className="mt-2 text-neutral-600">{t.orderTracking.intro}</p>
      <div className="mt-6">
        <OrderTrackingForm initialRef={initialRef} />
      </div>
    </div>
  );
}
