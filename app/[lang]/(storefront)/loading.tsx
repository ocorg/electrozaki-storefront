import { getT } from "@/lib/i18n/server";

// Shown the instant a link is tapped, while the page loads (the header,
// footer and tab bar stay): the tap visibly went through.
export default async function Loading() {
  const t = await getT();
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-10">
      <span className="sr-only">{t.common.pageLoading}</span>
      <div aria-hidden className="animate-pulse">
        <div className="h-4 w-40 rounded-full bg-ink/8" />
        <div className="mt-4 h-9 w-3/4 max-w-xl rounded-2xl bg-ink/10" />
        <div className="mt-3 h-4 w-1/2 max-w-md rounded-full bg-ink/8" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-3xl bg-white p-3 ring-1 ring-ink/5">
              <div className="aspect-square rounded-2xl bg-ink/6" />
              <div className="mt-3 h-4 w-4/5 rounded-full bg-ink/8" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
