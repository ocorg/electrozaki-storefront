import { prisma } from "./client";

// The selectable list for the "pick your phone" compatibility checker.
// Deliberately scoped to phones that already appear as a target SOMEWHERE
// in ProductCompatibility, rather than every phone in the catalog — a phone
// nobody has mapped compatibility for yet would otherwise show up and
// always return a false "not compatible" instead of an honest "not
// confirmed yet".
export async function getCompatibilityTargetPhones(): Promise<
  { id: string; name: string }[]
> {
  const rows = await prisma.productCompatibility.findMany({
    select: { compatibleWith: { select: { id: true, name: true } } },
    distinct: ["compatibleWithId"],
  });

  return rows
    .map((r: { compatibleWith: { id: string; name: string } }) => r.compatibleWith)
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
}
