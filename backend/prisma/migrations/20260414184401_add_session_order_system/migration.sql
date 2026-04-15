-- CreateEnum
CREATE TYPE "OrderSessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CLOSED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderSessionId" TEXT;

-- CreateTable
CREATE TABLE "order_sessions" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "status" "OrderSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_sessions_sessionToken_key" ON "order_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "order_sessions_tableId_idx" ON "order_sessions"("tableId");

-- CreateIndex
CREATE INDEX "orders_orderSessionId_idx" ON "orders"("orderSessionId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderSessionId_fkey" FOREIGN KEY ("orderSessionId") REFERENCES "order_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_sessions" ADD CONSTRAINT "order_sessions_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
