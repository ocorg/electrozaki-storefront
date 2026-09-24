-- Website repair requests get a customer-facing number right away
-- (DEM-XXXXXX, random) and, once converted, the ERP ticket number.
ALTER TABLE "RepairRequest" ADD COLUMN "ref" TEXT;
ALTER TABLE "RepairRequest" ADD COLUMN "repairRef" TEXT;

-- Requests sent before this change get a number too.
UPDATE "RepairRequest" SET "ref" = 'DEM-' || upper(substr(md5(random()::text || "id"), 1, 6)) WHERE "ref" IS NULL;

ALTER TABLE "RepairRequest" ALTER COLUMN "ref" SET NOT NULL;
CREATE UNIQUE INDEX "RepairRequest_ref_key" ON "RepairRequest"("ref");
