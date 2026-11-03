-- One record per accessory family (owner, 2026-11-02): each photo says which
-- colour it shows, and the customer's chosen colour and phone model are kept
-- on the order line. Additive: nullable columns; existing rows keep null.
ALTER TABLE "ProductImage" ADD COLUMN "colorName" TEXT;
ALTER TABLE "OrderRequestItem" ADD COLUMN "optionColor" TEXT;
ALTER TABLE "OrderRequestItem" ADD COLUMN "optionModel" TEXT;
