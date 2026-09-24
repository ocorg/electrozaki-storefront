"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, CircleMarker } from "leaflet";

// Meknès, where parcels leave from — shown so the customer sees the trip.
const MEKNES: [number, number] = [33.8935, -5.5473];

type Props = { lat: number; lng: number; label: string };

// A small OpenStreetMap view with a pin on the chosen destination, so a
// customer can check it's the right place (several Moroccan localities share
// a name). Leaflet touches `window`, so it's loaded only in the browser.
export function DeliveryMap({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pinRef = useRef<CircleMarker | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
        L.circleMarker(MEKNES, { radius: 5, color: "#1a1a1a", weight: 2, fillOpacity: 0.6 })
          .bindTooltip("Electro Zaki — Meknès")
          .addTo(mapRef.current);
      }

      // Circle markers need no image files (Leaflet's default pin icon breaks
      // with bundlers).
      pinRef.current?.remove();
      pinRef.current = L.circleMarker([lat, lng], {
        radius: 10,
        color: "#b8912f",
        weight: 3,
        fillColor: "#c9a440",
        fillOpacity: 0.85,
      })
        .bindTooltip(label, { permanent: true, direction: "top", offset: [0, -10] })
        .addTo(mapRef.current);
      mapRef.current.setView([lat, lng], 9);
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lng, label]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="h-56 w-full overflow-hidden rounded-xl border border-black/10 bg-neutral-100"
      role="img"
      aria-label={`Carte : ${label}`}
    />
  );
}
