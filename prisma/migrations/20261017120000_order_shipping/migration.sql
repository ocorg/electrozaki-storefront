-- Shipping of website orders, mirrored from the ERP delivery they ship with
-- (customer tracking page /commande/suivi). Additive: existing orders keep
-- null values until the ERP links them to a delivery.
CREATE TYPE "ShippingStatus" AS ENUM ('CONFIRMING', 'AWAITING_ADVANCE', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED');

ALTER TABLE "OrderRequest"
  ADD COLUMN "erpDeliveryId" TEXT,
  ADD COLUMN "shippingStatus" "ShippingStatus",
  ADD COLUMN "trackingNumber" TEXT,
  ADD COLUMN "shippingUpdatedAt" TIMESTAMP(3);

CREATE INDEX "OrderRequest_erpDeliveryId_idx" ON "OrderRequest"("erpDeliveryId");
