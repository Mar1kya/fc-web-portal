/*
  Warnings:

  - You are about to drop the column `sofascoreId` on the `Coach` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Coach_sofascoreId_key";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "sofascoreId";
