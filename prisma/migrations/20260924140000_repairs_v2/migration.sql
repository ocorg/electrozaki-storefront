-- CreateEnum
CREATE TYPE "RepairKind" AS ENUM ('HARDWARE', 'SOFTWARE', 'CONSULTATION');

-- AlterTable
ALTER TABLE "RepairRequest" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "kind" "RepairKind" NOT NULL DEFAULT 'HARDWARE',
ADD COLUMN     "preferredSlot" TEXT;

-- CreateTable
CREATE TABLE "RepairTracking" (
    "ref" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "kind" "RepairKind" NOT NULL,
    "status" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "quoteAmount" DECIMAL(10,2),
    "quoteSentAt" TIMESTAMP(3),
    "quoteDecision" TEXT,
    "quoteDecidedAt" TIMESTAMP(3),
    "decisionApplied" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairTracking_pkey" PRIMARY KEY ("ref")
);

