// Sends one anonymous statistics signal to /api/a (see that route). No
// cookie: the visit's source is remembered for the tab only (sessionStorage).

type Signal =
  | { t: "view"; l?: number }
  | { t: "add_to_cart"; pid: string; v: number }
  | { t: "search"; q: string; r: number };

const SOURCE_KEY = "ez_src";

// Where the visit came from: ?utm_source=… first, else the referring site.
function detectSource(): string {
  const utm = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase();
  if (utm) return known(utm) ?? "autre";
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
  } catch {
    host = "";
  }
  if (!host || host === window.location.hostname) return "direct";
  return known(host) ?? "autre";
}

function known(v: string): string | null {
  if (/instagram/.test(v)) return "instagram";
  if (/facebook|^fb\b|fb\.(com|me)|messenger/.test(v)) return "facebook";
  if (/tiktok/.test(v)) return "tiktok";
  if (/whatsapp|wa\.me/.test(v)) return "whatsapp";
  if (/youtube|youtu\.be/.test(v)) return "youtube";
  if (/snapchat/.test(v)) return "snapchat";
  if (/google/.test(v)) return "google";
  if (/bing|yahoo|duckduckgo|qwant|ecosia|yandex/.test(v)) return "recherche";
  if (v === "qr") return "qr";
  return null;
}

export function visitSource(): string {
  try {
    const saved = window.sessionStorage.getItem(SOURCE_KEY);
    if (saved) return saved;
    const source = detectSource();
    window.sessionStorage.setItem(SOURCE_KEY, source);
    return source;
  } catch {
    return detectSource();
  }
}

export function track(signal: Signal): void {
  try {
    const body = JSON.stringify({ ...signal, p: window.location.pathname, s: visitSource() });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/a", blob)) {
      void fetch("/api/a", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
    }
  } catch {
    // Statistics must never break the page.
  }
}
