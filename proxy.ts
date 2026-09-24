import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { classifyBot, isProbe } from "@/lib/bots";

// Runs before every page: counts robots for the ERP's "Bouclier" statistics
// and refuses vulnerability probes. People pass straight through: no
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
  return NextResponse.next();
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
