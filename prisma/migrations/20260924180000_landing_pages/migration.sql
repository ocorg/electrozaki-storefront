-- CreateEnum
CREATE TYPE "LandingTheme" AS ENUM ('GOLD', 'INK', 'OCEAN', 'CORAL');

-- AlterTable
ALTER TABLE "OrderRequest" ADD COLUMN     "landingPageId" TEXT;

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT,
    "bannerUrl" TEXT,
    "theme" "LandingTheme" NOT NULL DEFAULT 'GOLD',
    "categoryId" TEXT,
    "discountType" "PromoCodeType",
    "discountValue" DECIMAL(10,2),
    "promoCodeId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageProduct" (
    "landingPageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LandingPageProduct_pkey" PRIMARY KEY ("landingPageId","productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "LandingPageProduct_productId_idx" ON "LandingPageProduct"("productId");

-- AddForeignKey
ALTER TABLE "OrderRequest" ADD CONSTRAINT "OrderRequest_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPageProduct" ADD CONSTRAINT "LandingPageProduct_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPageProduct" ADD CONSTRAINT "LandingPageProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

