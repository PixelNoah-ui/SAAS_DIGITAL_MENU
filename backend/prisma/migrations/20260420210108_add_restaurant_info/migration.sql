/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `restaurant_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preparationTime" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "restaurant_info" DROP COLUMN "logoUrl",
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "phone" DROP DEFAULT,
ALTER COLUMN "address" DROP DEFAULT,
ALTER COLUMN "room" DROP DEFAULT,
ALTER COLUMN "telegramUsername" DROP DEFAULT;
