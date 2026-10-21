-- Customer reviews of delivered website orders (one per order line).
-- Additive: a new table only.
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "modelKey" TEXT,
    "productName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "authorName" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductReview_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE UNIQUE INDEX "ProductReview_orderItemId_key" ON "ProductReview"("orderItemId");
CREATE INDEX "ProductReview_modelKey_hidden_idx" ON "ProductReview"("modelKey", "hidden");
CREATE INDEX "ProductReview_productId_hidden_idx" ON "ProductReview"("productId", "hidden");
CREATE INDEX "ProductReview_createdAt_idx" ON "ProductReview"("createdAt");

ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderRequestItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
