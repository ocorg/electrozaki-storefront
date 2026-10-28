-- Accessories in several colours: each colour is its own product; the colours
-- of one model share colorGroup (owner, 2026-10-29). A product's own photo of
-- a ticked feature ("Extras": card holder, stand, strap).
-- Additive: nullable columns and an index; existing rows keep null.
ALTER TABLE "Product" ADD COLUMN "colorName" TEXT;
ALTER TABLE "Product" ADD COLUMN "colorGroup" TEXT;
CREATE INDEX "Product_colorGroup_idx" ON "Product"("colorGroup");
ALTER TABLE "ProductFacet" ADD COLUMN "imageUrl" TEXT;
