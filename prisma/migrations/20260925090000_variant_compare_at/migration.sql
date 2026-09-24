-- Per-unit promo: the ERP's price before its promo, shown struck through.
ALTER TABLE "ProductVariant" ADD COLUMN "compareAtPrice" DECIMAL(10,2);
