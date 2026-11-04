import { prisma } from "./client";
import type { PaletteColor } from "@/lib/colors";

/** The listed colours among these names (an accessory's photo colours), by French name. */
export async function getPalette(names: (string | null | undefined)[]): Promise<Record<string, PaletteColor>> {
  const wanted = [...new Set(names.filter((n): n is string => Boolean(n)))];
  if (wanted.length === 0) return {};
  const rows = await prisma.color.findMany({
    where: { name: { in: wanted } },
    select: { name: true, nameEn: true, nameAr: true, hex: true, motif: true },
  });
  return Object.fromEntries(rows.map((r) => [r.name, r]));
}
