import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Prisma 7 has no Rust query-engine binary by default — the connection is
// made entirely through this driver adapter, using Neon's serverless driver
// under the hood. This also sidesteps the "could not locate the Query
// Engine for runtime ..." failure that Rust-engine Prisma setups are known
// to hit on Vercel.
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

// Next.js hot-reloads modules in dev, which would otherwise create a new
// PrismaClient (and a new connection) on every file save. Stashing it on
// `globalThis` keeps a single instance alive across reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
