import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ChevronLeft } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { TrackingForm } from "./TrackingForm";

export async function generateMetadata(): Promise<Metadata> {
  const { tracking } = await getT();
  return { title: tracking.metaTitle, description: tracking.metaDescription, robots: { index: false } };
}

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function RepairTrackingPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const initialRef =
    typeof ref === "string" && /^(REP-\d{1,8}|DEM-[A-Z0-9]{6})$/i.test(ref) ? ref.toUpperCase() : "";

  const t = await getT();

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link href="/reparation" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-ink">
        <ChevronLeft size={16} className="rtl:rotate-180" /> {t.common.repair}
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{t.tracking.title}</h1>
      <p className="mt-2 text-neutral-600">
        {t.tracking.intro}
      </p>
      <div className="mt-6">
        <TrackingForm initialRef={initialRef} />
      </div>
    </div>
  );
}
