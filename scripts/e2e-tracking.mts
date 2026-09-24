// Repair tracking lookups and online quote answers (lib/repair-tracking.ts)
// against a TEST database branch. Never against production.
//   npx tsx scripts/e2e-tracking.mts
import "dotenv/config";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { findTrackedRepair, answerTrackedQuote } from "@/lib/repair-tracking";

const PRODUCTION_HOST = "ep-still-tree-b1u5yng9";
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes(PRODUCTION_HOST)) {
  console.error("DATABASE_URL must point at a Neon TEST branch, not production.");
  process.exit(1);
}

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: unknown) =>
  results.push({ name, ok, detail: detail === undefined ? undefined : JSON.stringify(detail) });

// Same fingerprint the ERP writes (src/lib/storefront/tracking.ts).
const hash = (phone: string) =>
  createHmac("sha256", process.env.REVALIDATE_SECRET!).update(`track:${phone.replace(/\D/g, "").slice(-9)}`).digest("base64url");

const REF = "REP-99" + String(Math.floor(1000 + Math.random() * 8999));
const PHONE = "0661234567";

async function main() {
  try {
    await prisma.repairTracking.create({
      data: { ref: REF, phoneHash: hash(PHONE), kind: "HARDWARE", status: "devis_envoye", device: "Apple iPhone 12", quoteAmount: 450, quoteSentAt: new Date() },
    });

    const found = await findTrackedRepair(REF, PHONE);
    check("lookup with ticket + phone works", found?.ref === REF && found.quoteAmount === 450, found);
    check("same phone typed differently still matches (+212 6 61…)", (await findTrackedRepair(REF.toLowerCase(), "+212 6 61 23 45 67"))?.ref === REF);
    check("wrong phone → nothing", (await findTrackedRepair(REF, "0700000000")) === null);
    check("ticket number alone → nothing", (await findTrackedRepair(REF, "")) === null);
    check("malformed ticket number → nothing", (await findTrackedRepair("REP-1; drop", PHONE)) === null);

    const wrongPhone = await answerTrackedQuote(REF, "0700000000", true);
    check("answering with the wrong phone does nothing", wrongPhone === null);

    const accepted = await answerTrackedQuote(REF, PHONE, true);
    const row = await prisma.repairTracking.findUnique({ where: { ref: REF } });
    check("customer accepts the quote online", accepted?.quoteDecision === "ACCEPTED" && row?.quoteDecision === "ACCEPTED" && row?.decisionApplied === false, row);

    const twice = await answerTrackedQuote(REF, PHONE, false);
    const after = await prisma.repairTracking.findUnique({ where: { ref: REF } });
    check("a second answer can't overwrite the first", twice === null && after?.quoteDecision === "ACCEPTED", after);

    await prisma.repairTracking.update({ where: { ref: REF }, data: { status: "en_cours" } });
    check("no answer possible when no quote is pending", (await answerTrackedQuote(REF, PHONE, true)) === null);
  } catch (err) {
    check("script ran to the end", false, String((err as Error)?.stack ?? err));
  } finally {
    await prisma.repairTracking.deleteMany({ where: { ref: REF } });
    await prisma.$disconnect();
  }
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  → ${r.detail}`}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

void main();
