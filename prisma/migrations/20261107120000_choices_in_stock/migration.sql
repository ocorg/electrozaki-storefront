-- Stock per variant (owner, 2026-11-07): the choices of an accessory family
-- still in stock, written by the ERP sync. Null = no restriction.
ALTER TABLE "Product" ADD COLUMN "choicesInStock" JSONB;
