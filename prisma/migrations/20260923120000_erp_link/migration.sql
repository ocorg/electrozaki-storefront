-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('MANUAL', 'ERP');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "erpCode" TEXT;

-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "receiptKey" TEXT;

-- AlterTable
ALTER TABLE "OrderRequestItem" ADD COLUMN     "bundleId" TEXT,
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unitRef" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "erpKey" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "source" "ProductSource" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "ProductInternal" ALTER COLUMN "purchasePrice" DROP NOT NULL,
ALTER COLUMN "minSalePrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "erpRef" TEXT;

-- CreateTable
CREATE TABLE "ModelPhoto" (
    "id" TEXT NOT NULL,
    "modelKey" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" BIGSERIAL NOT NULL,
    "bucket" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelPhoto_modelKey_color_key" ON "ModelPhoto"("modelKey", "color");

-- CreateIndex
CREATE INDEX "RateLimitHit_bucket_keyHash_createdAt_idx" ON "RateLimitHit"("bucket", "keyHash", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitHit_createdAt_idx" ON "RateLimitHit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_erpCode_key" ON "Category"("erpCode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_erpKey_key" ON "Product"("erpKey");

-- CreateIndex
CREATE INDEX "Product_published_idx" ON "Product"("published");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_erpRef_key" ON "ProductVariant"("erpRef");

