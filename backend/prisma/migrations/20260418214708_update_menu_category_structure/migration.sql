/*
  Warnings:

  - You are about to drop the column `categoryId` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProof` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `menu_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_categoryId_fkey";

-- DropIndex
DROP INDEX "menu_items_categoryId_idx";

-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "categoryId",
DROP COLUMN "image",
DROP COLUMN "isAvailable",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentProof";

-- DropTable
DROP TABLE "categories";
