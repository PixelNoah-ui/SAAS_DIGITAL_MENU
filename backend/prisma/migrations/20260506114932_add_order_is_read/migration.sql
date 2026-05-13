-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "orders_isRead_idx" ON "orders"("isRead");
