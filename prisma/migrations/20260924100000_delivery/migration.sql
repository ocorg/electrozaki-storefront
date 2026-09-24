-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryEstimate" DATE,
ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryUnavailable" BOOLEAN NOT NULL DEFAULT false;
