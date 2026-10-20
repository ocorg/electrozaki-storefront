import type { ReactNode } from "react";

// A drawn iPhone settings screen (the guides): where to tap, what you'll
// read. Plain markup, usable from server and client components. Colours are
// iOS's own (light mode), whatever the site's theme, so it reads as a phone.

export type IosRow = { label: string; value?: ReactNode; chevron?: boolean; highlight?: boolean };

export function IosScreen({
  back,
  title,
  groups,
  caption,
  className = "",
}: {
  back?: string;
  title: string;
  groups: IosRow[][];
  caption: string;
  className?: string;
}) {
  return (
    <figure className={`mx-auto w-full max-w-[300px] ${className}`}>
      <div className="rounded-[2.4rem] bg-[#1c1c1e] p-2 shadow-[0_30px_60px_-30px_rgb(17_16_19/0.55)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#f2f2f7] pb-6 text-[#000]">
          {/* status bar and island */}
          <div aria-hidden className="flex h-9 items-center justify-between px-6 pt-1 text-[12px] font-semibold" dir="ltr">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-[#1c1c1e]" />
            <span className="tracking-tight">▮▮▮</span>
          </div>
          <div className="px-4">
            {back && (
              <p className="mt-1 text-[15px] text-[#007aff]">
                <span aria-hidden className="inline-block rtl:rotate-180">‹</span> {back}
              </p>
            )}
            <p className="mt-1 text-[22px] font-bold leading-tight">{title}</p>
            <div className="mt-3 space-y-4">
              {groups.map((rows, g) => (
                <ul key={g} className="divide-y divide-black/10 overflow-hidden rounded-xl bg-white">
                  {rows.map((row) => (
                    <li
                      key={row.label}
                      className={`flex min-h-11 items-center justify-between gap-3 px-3 py-2 text-[14px] ${
                        row.highlight ? "bg-[#fff5dc] shadow-[inset_0_0_0_2px_#c8922a]" : ""
                      }`}
                    >
                      <span className="min-w-0">{row.label}</span>
                      <span className="flex flex-none items-center gap-1 text-[#8e8e93]">
                        {row.value}
                        {row.chevron && (
                          <span aria-hidden className="text-[#c7c7cc] rtl:rotate-180">
                            ›
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-neutral-500">{caption}</figcaption>
    </figure>
  );
}
