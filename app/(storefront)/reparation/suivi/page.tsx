import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TrackingForm } from "./TrackingForm";

export const metadata: Metadata = {
  title: "Suivi de réparation",
  description: "Suivez l'avancement de votre réparation Electro Zaki et validez votre devis en ligne.",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function RepairTrackingPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const initialRef = typeof ref === "string" && /^REP-\d{1,8}$/i.test(ref) ? ref.toUpperCase() : "";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link href="/reparation" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-ink">
        <ChevronLeft size={16} /> Réparation
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Suivre ma réparation</h1>
      <p className="mt-2 text-neutral-600">
        Entrez le numéro inscrit sur votre bon de dépôt et le téléphone donné en boutique.
      </p>
      <div className="mt-6">
        <TrackingForm initialRef={initialRef} />
      </div>
    </div>
  );
}
