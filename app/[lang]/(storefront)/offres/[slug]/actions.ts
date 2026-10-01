"use server";

import { allowRequest } from "@/lib/rate-limit";
import { countLandingView } from "@/lib/db/landing";

// Counted from the browser (the page itself is cached), a few per visitor
// per hour at most, so reloading can't inflate the ERP's visit figures.
export async function recordLandingView(pageId: string): Promise<void> {
  if (!(await allowRequest("view"))) return;
  await countLandingView(String(pageId ?? ""));
}
