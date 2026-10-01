"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Clock, MapPin, Search, Truck, X } from "lucide-react";
import { formatMAD } from "@/lib/format";
import { DELIVERY_CITIES, ORDER_CUTOFF_HOUR, dayParts, estimateDelivery, findCity, searchKey } from "@/lib/delivery";
import { useT } from "@/components/i18n/I18nProvider";

// Leaflet needs the browser — never render the map on the server.
const DeliveryMap = dynamic(() => import("./DeliveryMap").then((m) => m.DeliveryMap), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-xl bg-neutral-100" />,
});

const INDEX = DELIVERY_CITIES.map((c) => ({ city: c, key: searchKey(c.name) }));

type Props = {
  value: string | null;
  onChangeAction: (cityName: string | null) => void;
};

export function DeliveryPicker({ value, onChangeAction }: Props) {
  const t = useT();
  const dl = t.delivery;
  const fullDay = (isoDate: string) => {
    const p = dayParts(isoDate);
    return dl.date(dl.weekdays[p.weekday], p.day, dl.months[p.month]);
  };
  const relativeDay = (isoDate: string) => {
    const offset = dayParts(isoDate).offset;
    return offset === 0 ? dl.today : offset === 1 ? dl.tomorrow : fullDay(isoDate);
  };
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const city = findCity(value);

  const matches = useMemo(() => {
    const q = searchKey(query);
    if (!q) return [];
    const starts = INDEX.filter((i) => i.key.startsWith(q));
    const contains = INDEX.filter((i) => !i.key.startsWith(q) && i.key.includes(q));
    return [...starts, ...contains].slice(0, 40).map((i) => i.city);
  }, [query]);

  // Recomputed on each render: the date shown follows the store clock.
  const estimate = city ? estimateDelivery(city) : null;

  function choose(name: string) {
    onChangeAction(name);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        <Clock size={14} className="mt-0.5 shrink-0" />
        {dl.cutoff(ORDER_CUTOFF_HOUR)}
      </p>

      {city ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gold/60 bg-gold/5 px-3 py-2">
          <span className="flex items-center gap-2 font-medium">
            <MapPin size={16} className="text-gold-deep" />
            {city.name}
          </span>
          <button
            type="button"
            onClick={() => onChangeAction(null)}
            className="flex items-center gap-1 text-xs text-neutral-500 underline hover:text-ink"
          >
            <X size={12} /> {dl.change}
          </button>
        </div>
      ) : (
        <div className="relative">
          <label htmlFor="delivery-city" className="mb-1 block text-sm font-medium">
            {dl.cityLabel}
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="delivery-city"
              type="text"
              autoComplete="off"
              placeholder={dl.cityPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="min-h-11 w-full rounded-lg border border-black/15 ps-9 pe-3 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          {open && query.trim() && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg">
              {matches.length === 0 ? (
                <li className="px-3 py-2 text-sm text-neutral-500">
                  {dl.noCity}
                </li>
              ) : (
                matches.map((c) => {
                  const served = c.days.filter(Boolean).length;
                  return (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => choose(c.name)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-neutral-50"
                      >
                        <span>{c.name}</span>
                        <span className={`shrink-0 text-xs ${served ? "text-neutral-500" : "text-amber-700"}`}>
                          {served ? formatMAD(c.fee) : dl.notServed}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      )}

      {city && estimate && (
        <div className="space-y-3 rounded-xl border border-black/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <Truck size={16} /> {dl.carrier}
            </span>
            <span className="font-semibold">{formatMAD(city.fee)}</span>
          </div>

          <div className="flex flex-wrap gap-1" aria-label={dl.days}>
            {dl.weekdaysShort.map((d, i) => (
              <span
                key={d}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  city.days[i] ? "bg-green-50 font-medium text-green-800" : "bg-neutral-100 text-neutral-400 line-through"
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {estimate.deliverable ? (
            <div className="space-y-1 text-sm text-neutral-700">
              <p>
                {dl.shipping} <b>{relativeDay(estimate.shipDate)}</b>
                {estimate.afterCutoff && dl.afterCutoff(ORDER_CUTOFF_HOUR)} {dl.estimated}{" "}
                <b>{fullDay(estimate.deliveryDate)}</b>.
              </p>
              {estimate.waitsForDeliveryDay && (
                <p className="text-xs text-neutral-500">
                  {dl.waits(city.name)}
                </p>
              )}
              <p className="text-xs text-neutral-500">{dl.indicative}</p>
            </div>
          ) : (
            <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                {dl.notDeliverableBefore} <b>{city.name}</b>
                {dl.notDeliverableAfter}
              </p>
            </div>
          )}

          {city.lat !== null && city.lng !== null ? (
            <div className="space-y-1">
              <DeliveryMap lat={city.lat} lng={city.lng} label={city.name} ariaLabel={dl.map(city.name)} />
              <p className="text-xs text-neutral-500">
                {dl.checkPin}
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              {dl.noPin}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
