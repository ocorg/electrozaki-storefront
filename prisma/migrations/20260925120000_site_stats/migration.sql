-- Site statistics: anonymous visit events + daily robot counters (ERP: Site web → Statistiques).
-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "productId" TEXT,
    "value" DECIMAL(10,2),
    "query" TEXT,
    "results" INTEGER,
    "source" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "loadMs" INTEGER,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotHit" (
    "day" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BotHit_pkey" PRIMARY KEY ("day","category","name")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "BotHit_day_idx" ON "BotHit"("day");

