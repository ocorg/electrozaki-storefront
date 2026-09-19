-- CreateEnum
CREATE TYPE "AdvancePaymentStatus" AS ENUM ('NOT_REQUIRED', 'AWAITING_RECEIPT', 'RECEIPT_UPLOADED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "advancePaymentStatus" "AdvancePaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "dataConsentAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "receiptUploadedAt" TIMESTAMP(3),
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "requiresAdvance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPhone" BOOLEAN NOT NULL DEFAULT false;
