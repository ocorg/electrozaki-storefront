import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // The CLI (migrate, db push, studio) needs a direct, unpooled
    // connection — the app itself uses the pooled DATABASE_URL via the
    // Neon adapter in lib/db/client.ts, not this file.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
