"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Clock, MapPin, Search, Truck, X } from "lucide-react";
import { formatMAD } from "@/lib/format";
import {
  DELIVERY_CITIES,
  ORDER_CUTOFF_HOUR,
  WEEKDAYS_FR,
  estimateDelivery,
  findCity,
  frenchDay,
  relativeDay,
  searchKey,
} from "@/lib/delivery";

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
        Commandes reçues avant {ORDER_CUTOFF_HOUR}h00 : expédiées le jour même (enlèvement par Ameex vers 13h00).
        Après {ORDER_CUTOFF_HOUR}h00 : expédition le lendemain.
      </p>

      {city ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-gold/60 bg-gold/5 px-3 py-2">
          <span className="flex items-center gap-2 font-medium">
            <MapPin size={16} className="text-gold" />
            {city.name}
          </span>
          <button
            type="button"
            onClick={() => onChangeAction(null)}
            className="flex items-center gap-1 text-xs text-neutral-500 underline hover:text-ink"
          >
            <X size={12} /> Changer
          </button>
        </div>
      ) : (
        <div className="relative">
          <label htmlFor="delivery-city" className="mb-1 block text-sm font-medium">
            Ville ou localité de livraison
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="delivery-city"
              type="text"
              autoComplete="off"
              placeholder="Tapez votre ville (ex : Fès, Agadir, Tiflet…)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="min-h-11 w-full rounded-lg border border-black/15 pl-9 pr-3 focus:border-gold focus:outline-none"
            />
          </div>
          {open && query.trim() && (
            <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg">
              {matches.length === 0 ? (
                <li className="px-3 py-2 text-sm text-neutral-500">
                  Aucune localité trouvée — essayez une autre orthographe ou la ville la plus proche.
                </li>
              ) : (
                matches.map((c) => {
                  const served = c.days.filter(Boolean).length;
                  return (
                    <li key={c.name}>
                      <button
                        type="button"
                        onClick={() => choose(c.name)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                      >
                        <span>{c.name}</span>
                        <span className={`shrink-0 text-xs ${served ? "text-neutral-500" : "text-amber-700"}`}>
                          {served ? formatMAD(c.fee) : "non desservie"}
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
              <Truck size={16} /> Livraison Ameex
            </span>
            <span className="font-semibold">{formatMAD(city.fee)}</span>
          </div>

          <div className="flex flex-wrap gap-1" aria-label="Jours de livraison">
            {WEEKDAYS_FR.map((d, i) => (
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
                Expédition <b>{relativeDay(estimate.shipDate)}</b>
                {estimate.afterCutoff && ` (commande reçue après ${ORDER_CUTOFF_HOUR}h00)`} — livraison estimée le{" "}
                <b>{frenchDay(estimate.deliveryDate)}</b>.
              </p>
              {estimate.waitsForDeliveryDay && (
                <p className="text-xs text-neutral-500">
                  Ameex ne livre {city.name} que certains jours : votre colis attendra au dépôt le prochain jour de
                  passage.
                </p>
              )}
              <p className="text-xs text-neutral-400">Délai indicatif (24 à 30 h après l&apos;enlèvement), hors imprévus du transporteur.</p>
            </div>
          ) : (
            <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                Ameex ne livre pas actuellement à <b>{city.name}</b>. Vous pouvez quand même commander : nous vous
                contacterons pour trouver une solution (ville voisine, point de retrait…). Le délai de livraison ne peut
                pas être garanti.
              </p>
            </div>
          )}

          {city.lat !== null && city.lng !== null ? (
            <div className="space-y-1">
              <DeliveryMap lat={city.lat} lng={city.lng} label={city.name} />
              <p className="text-xs text-neutral-500">
                Vérifiez que le repère correspond bien à votre localité (position approximative). Sinon, choisissez un
                autre nom dans la liste.
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Cette localité n&apos;est pas encore placée sur la carte — vérifiez bien le nom choisi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
