// Tells robots from people by their user agent, for the "Bouclier" section
// of the ERP statistics. Good robots (search engines, link previews) are
// counted and let through; only vulnerability probes are refused (proxy.ts).
// Pure functions: safe to import from the proxy without loading the database.

export type BotCategory = "ai" | "search" | "social" | "seo" | "monitor" | "script" | "other" | "probe" | "blocked";

// Most specific first: "Applebot-Extended" is an AI crawler, "Applebot" a search engine.
const RULES: [BotCategory, RegExp][] = [
  ["ai", /(gptbot|chatgpt-user|oai-searchbot|claudebot|claude-user|claude-searchbot|anthropic-ai|ccbot|perplexitybot|perplexity-user|google-extended|applebot-extended|amazonbot|bytespider|meta-externalagent|cohere-ai|diffbot|youbot|mistralai-user|timpibot|imagesiftbot)/i],
  ["search", /(googlebot|google-inspectiontool|storebot-google|adsbot-google|mediapartners-google|bingbot|bingpreview|applebot|yandex\w*|duckduckbot|duckassistbot|baiduspider|slurp|qwantbot|qwantify|seznambot|petalbot|sogou|exabot)/i],
  // Link previewers only — not the apps' own in-app browsers (Instagram,
  // TikTok, Snapchat… open links for real people with their name in the UA).
  ["social", /(facebookexternalhit|facebookcatalog|meta-externalfetcher|whatsapp\/|telegrambot|twitterbot|linkedinbot|pinterestbot|slackbot|discordbot|skypeuripreview|redditbot|tiktokspider|iframely|embedly)/i],
  ["seo", /(ahrefsbot|ahrefssiteaudit|semrushbot|mj12bot|dotbot|dataforseobot|serpstatbot|blexbot|rogerbot|screaming frog|seokicks|barkrowler|siteauditbot|seznam|awariobot|linkpadbot)/i],
  ["monitor", /(uptimerobot|pingdom|statuscake|site24x7|betteruptime|better uptime|vercel-screenshot|vercel-favicon|vercelbot|checkly|freshping|hetrixtools)/i],
  ["script", /(curl|wget|python-requests|python-urllib|python-httpx|aiohttp|httpx|go-http-client|node-fetch|undici|axios|okhttp|java\/|libwww|scrapy|headlesschrome|phantomjs|puppeteer|playwright|postmanruntime|insomnia|httpclient|guzzle|ruby|perl|masscan|zgrab|nmap|nuclei|sqlmap|nikto)/i],
  // Generic names ("SomeBot/1.0", "…crawler"), never a phone model like "Cubot".
  ["other", /(\bbot\b|[a-z]bot\/|crawler|spider|\bcrawl\b|scanner)/i],
];

/** The robot behind a user agent, or null for a (probable) person. */
export function classifyBot(ua: string | null | undefined): { category: BotCategory; name: string } | null {
  const agent = (ua ?? "").trim();
  if (!agent) return { category: "script", name: "(sans nom)" };
  for (const [category, re] of RULES) {
    const m = agent.match(re);
    if (m) return { category, name: m[1].toLowerCase().replace(/\/$/, "").slice(0, 40) };
  }
  return null;
}

// Paths only an attacker asks for (WordPress, PHP, leaked config files…).
// This site has none of them, so they are refused straight away.
const PROBE = /(\.(php\d?|asp|aspx|jsp|cgi|env|git|sql|bak|old|ini|ya?ml|config|log|sh|dll|exe)(\/|$))|^\/(wp-|wordpress|phpmyadmin|pma|myadmin|administrator|cgi-bin|xmlrpc|\.env|\.git|\.aws|\.ssh|\.vscode|\.DS_Store|vendor\/|boaform|actuator|hnap1|owa\/|autodiscover|server-status|telescope|debug\/|console\/|solr\/|jenkins|manager\/html|admin\.)/i;

export function isProbe(pathname: string): boolean {
  return PROBE.test(pathname);
}

/** What kind of screen, for the device breakdown. */
export function deviceOf(ua: string | null | undefined): "mobile" | "tablet" | "desktop" {
  const agent = ua ?? "";
  if (/ipad|tablet|kindle|silk|(android(?!.*mobi))/i.test(agent)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(agent)) return "mobile";
  return "desktop";
}
