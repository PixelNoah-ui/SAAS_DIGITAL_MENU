/*
  Warnings:

  - You are about to drop the column `room` on the `restaurant_info` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `menu_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "restaurant_info" DROP COLUMN "room";

-- CreateIndex
CREATE INDEX "menu_items_category_idx" ON "menu_items"("category");

-- CreateIndex
CREATE INDEX "menu_items_price_idx" ON "menu_items"("price");

-- CreateIndex
CREATE INDEX "menu_items_createdAt_idx" ON "menu_items"("createdAt");
