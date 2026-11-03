-- Accessory families (owner, 2026-11-03): each photo can say its design and the
-- phone shape the case is cut for; the order line keeps the design chosen.
ALTER TABLE "ProductImage" ADD COLUMN "designName" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "phoneShape" TEXT;
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_phoneShape_check" CHECK ("phoneShape" IN ('carre', 'pilule', 'plateau'));
ALTER TABLE "OrderRequestItem" ADD COLUMN "optionDesign" TEXT;
