/*
  Warnings:

  - The values [NEW,REFURBISHED,USED] on the enum `ProductCondition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCondition_new" AS ENUM ('NEUF', 'TRES_BON', 'BON', 'PIECES_REMPLACEES');
ALTER TABLE "Product" ALTER COLUMN "condition" TYPE "ProductCondition_new" USING ("condition"::text::"ProductCondition_new");
ALTER TYPE "ProductCondition" RENAME TO "ProductCondition_old";
ALTER TYPE "ProductCondition_new" RENAME TO "ProductCondition";
DROP TYPE "public"."ProductCondition_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "batteryHealthPercent" INTEGER,
ADD COLUMN     "hasDefects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transparencyNotes" TEXT;

-- CreateTable
CREATE TABLE "ProductCompatibility" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "compatibleWithId" TEXT NOT NULL,
    "isGiftOption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductCompatibility_compatibleWithId_idx" ON "ProductCompatibility"("compatibleWithId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCompatibility_productId_compatibleWithId_key" ON "ProductCompatibility"("productId", "compatibleWithId");

-- AddForeignKey
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCompatibility" ADD CONSTRAINT "ProductCompatibility_compatibleWithId_fkey" FOREIGN KEY ("compatibleWithId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
