-- When the customer accepted the terms of sale before ordering (law 31-08).
-- Additive: a nullable column; earlier orders keep null.
ALTER TABLE "OrderRequest" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
