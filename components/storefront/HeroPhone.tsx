"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Flashlight } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import type { ShowcasePhone } from "@/lib/db/storefront";
import { useMeknesClock } from "@/components/storefront/LiveClock";

// The hero's centrepiece: a phone whose lock screen *is* the shop. Real
// phones in stock arrive as notifications, one every few seconds (paused on
// hover/focus, and not cycling at all under reduced motion). Each one links
// to its product page.

const EVERY_MS = 3400;

function Notification({ phone, dimmed = false }: { phone: ShowcasePhone; dimmed?: boolean }) {
  const t = useT();
  const detail = [
    t.grades.label[phone.condition] ?? phone.condition,
    phone.battery !== null && phone.condition !== "NEUF" ? t.hero.battShort(phone.battery) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <span
      className={`flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-[#2b2620]/95 p-3 text-start backdrop-blur-xl ${dimmed ? "" : "shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]"}`}
    >
      <span className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-[30%] bg-white">
        {phone.image ? (
          <Image src={phone.image} alt="" fill sizes="44px" className="object-contain p-0.5" />
        ) : (
          <span className="font-display text-sm font-extrabold text-ink">EZ</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/60">
          <span>Electro Zaki</span>
          <span className="normal-case tracking-normal">{t.hero.inStock}</span>
        </span>
        <span className="block truncate text-[13px] font-bold text-white">{phone.name}</span>
        <span className="flex items-center justify-between gap-2 text-[11px] text-white/75">
          <span className="truncate">{detail}</span>
          <span className="readout flex-none font-bold text-gold-bright">
            {phone.fromPrice ? `${t.common.from} ` : ""}
            {formatMAD(phone.price)}
          </span>
        </span>
      </span>
    </span>
  );
}

export function HeroPhone({ phones }: { phones: ShowcasePhone[] }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const time = useMeknesClock("time");
  const day = useMeknesClock("day");

  useEffect(() => {
    if (paused || phones.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % phones.length), EVERY_MS);
    return () => clearInterval(id);
  }, [paused, phones.length]);

  const current = phones[index];
  const next = phones.length > 1 ? phones[(index + 1) % phones.length] : null;
  const after = phones.length > 2 ? phones[(index + 2) % phones.length] : null;

  return (
    <div
      className="relative mx-auto aspect-[9/18.6] w-[260px] sm:w-[300px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Frame: titanium-dark body with a brass edge light. */}
      <div className="absolute inset-0 rounded-[3.2rem] bg-gradient-to-b from-[#3a3632] via-ink-3 to-[#2b2824] p-[3px] shadow-[0_0_0_1px_rgb(230_181_85/0.25),0_50px_100px_-30px_rgb(0_0_0/0.9),0_0_80px_-20px_rgb(200_146_42/0.35)]">
        <div className="relative h-full w-full overflow-hidden rounded-[3rem] bg-black p-[9px]">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.5rem] bg-[radial-gradient(120%_70%_at_20%_0%,#6b4a14_0%,transparent_55%),radial-gradient(100%_60%_at_100%_100%,#3a2a0e_0%,transparent_60%),linear-gradient(180deg,#1a1712,#0b0a09)] px-3.5 pb-3 pt-3">
            {/* Dynamic island */}
            <span className="mx-auto h-[26px] w-[92px] flex-none rounded-full bg-black" aria-hidden />

            <div className="mt-5 text-center text-white">
              <p className="text-[13px] font-semibold text-white/80 first-letter:uppercase">{day || " "}</p>
              <p className="font-display text-[64px] font-bold leading-none tracking-tight sm:text-[72px]">
                {time || " "}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/60">{t.hero.lockCaption}</p>
            </div>

            {/* Wallpaper: the brand mark, faint. */}
            <div className="relative flex flex-1 items-center justify-center" aria-hidden>
              <Image src="/logo-mark.png" alt="" width={120} height={120} className="h-24 w-24 opacity-[0.12]" />
            </div>

            {/* Notification stack, iOS style: newest on top, two peeking below. */}
            <div className="relative mb-4 h-[92px]">
              {current && (
                <>
                  {after && (
                    <span aria-hidden className="absolute inset-x-4 top-[18px] block">
                      <span className="block scale-[0.9] opacity-40 blur-[0.3px]">
                        <Notification phone={after} dimmed />
                      </span>
                    </span>
                  )}
                  {next && (
                    <span aria-hidden className="absolute inset-x-2 top-[9px] block">
                      <span className="block scale-[0.95] opacity-70">
                        <Notification phone={next} dimmed />
                      </span>
                    </span>
                  )}
                  <Link
                    key={current.slug}
                    href={`/products/${current.slug}`}
                    className="absolute inset-x-0 top-0 block animate-notif rounded-[1.1rem]"
                  >
                    <Notification phone={current} />
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-3 pb-2" aria-hidden>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
                <Flashlight size={18} />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
                <Camera size={18} />
              </span>
            </div>
            <span className="mx-auto mb-0.5 h-[5px] w-28 flex-none rounded-full bg-white/80" aria-hidden />
          </div>
        </div>
      </div>
      {/* Side buttons */}
      <span aria-hidden className="absolute -left-[3px] top-[18%] h-8 w-[3px] rounded-l bg-[#3a3632]" />
      <span aria-hidden className="absolute -left-[3px] top-[26%] h-14 w-[3px] rounded-l bg-[#3a3632]" />
      <span aria-hidden className="absolute -right-[3px] top-[24%] h-20 w-[3px] rounded-r bg-[#3a3632]" />
    </div>
  );
}
