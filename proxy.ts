import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { classifyBot, isProbe } from "@/lib/bots";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// Runs before every page: counts robots for the ERP's "Bouclier" statistics,
// refuses vulnerability probes, and sends addresses without a language
// prefix (every link from before the site had languages) to their
// /fr, /ar, /en or /darija version. People pass straight through: no
// database work on their path (the counter is loaded only for robots, and
// written after the response is sent).
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (isProbe(pathname)) {
    event.waitUntil(import("@/lib/bot-hits").then((m) => m.recordBot("probe", probeName(pathname))));
    return new NextResponse(null, { status: 404 });
  }

  const bot = classifyBot(request.headers.get("user-agent"));
  if (bot) event.waitUntil(import("@/lib/bot-hits").then((m) => m.recordBot(bot.category, bot.name)));

  if (!needsLocale(pathname)) return NextResponse.next();

  const preferred = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred.locale}${pathname === "/" ? "" : pathname}`;
  // An old deep link with no stated preference is permanently French (that
  // is what it always was — search engines move its ranking over). The home
  // page, or a visitor who prefers another language, gets a temporary one.
  const permanent = pathname !== "/" && !preferred.stated;
  const res = NextResponse.redirect(url, permanent ? 308 : 307);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

// Pages only: not the API, not files (sitemap.xml, robots.txt, images…),
// and not an address that already starts with a language.
function needsLocale(pathname: string): boolean {
  if (pathname.startsWith("/api/") || pathname === "/api") return false;
  if (/\.[a-z0-9]{2,12}$/i.test(pathname)) return false;
  if (pathname.startsWith("/opengraph-image") || pathname.startsWith("/icon") || pathname.startsWith("/apple-icon")) return false;
  return !isLocale(pathname.split("/")[1]);
}

// The language picked in the switcher, else the browser's, else French.
// (Darija has no browser language code of its own: it's reached by choice.)
function preferredLocale(request: NextRequest): { locale: Locale; stated: boolean } {
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return { locale: chosen, stated: true };

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((x) => x.lang && Number.isFinite(x.q))
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (lang === "ar" || lang === "en" || lang === "fr") return { locale: lang, stated: lang !== DEFAULT_LOCALE };
  }
  return { locale: DEFAULT_LOCALE, stated: false };
}

// "/wp-login.php" → "wp-login.php": what was being looked for, not the full URL.
function probeName(pathname: string): string {
  return (pathname.split("/").filter(Boolean)[0] ?? "/").toLowerCase().slice(0, 40);
}

export const config = {
  // Not for the build's own files, images and icons (never asked for by name
  // by a probe, and far too many to count).
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|logo-mark.png|favicon.ico).*)"],
};
