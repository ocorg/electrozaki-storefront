import { prisma } from "./db/client";
import type { BotCategory } from "./bots";

// One counter per day, robot kind and name — never a row per request, so a
// crawler storm can't fill the database.
export async function recordBot(category: BotCategory, name: string): Promise<void> {
  const day = new Date(new Date().toISOString().slice(0, 10)); // store clock is GMT+0
  try {
    await prisma.botHit.upsert({
      where: { day_category_name: { day, category, name } },
      create: { day, category, name, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    // Statistics must never break a page.
  }
}
