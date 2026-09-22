-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cameraGenuine" BOOLEAN,
ADD COLUMN     "chargingPortGenuine" BOOLEAN,
ADD COLUMN     "speakerGenuine" BOOLEAN;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "batteryGenuine" BOOLEAN,
ADD COLUMN     "batteryHealthPercent" INTEGER,
ADD COLUMN     "cameraGenuine" BOOLEAN,
ADD COLUMN     "chargingPortGenuine" BOOLEAN,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "faceIdWorking" BOOLEAN,
ADD COLUMN     "hasDefects" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "screenGenuine" BOOLEAN,
ADD COLUMN     "speakerGenuine" BOOLEAN,
ADD COLUMN     "stockQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "storageLabel" TEXT,
ADD COLUMN     "transparencyNotes" TEXT;
