/*
  Warnings:

  - You are about to drop the column `name` on the `tables` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableNumber]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `capacity` to the `tables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableNumber` to the `tables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tables` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED');

-- AlterTable
ALTER TABLE "tables" DROP COLUMN "name",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "tableNumber" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tables_tableNumber_key" ON "tables"("tableNumber");
