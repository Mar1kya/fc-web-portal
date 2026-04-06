/*
  Warnings:

  - A unique constraint covering the columns `[sofascoreId]` on the table `Season` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sofascoreId]` on the table `Tournament` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "sofascoreId" INTEGER;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "sofascoreId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Season_sofascoreId_key" ON "Season"("sofascoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_sofascoreId_key" ON "Tournament"("sofascoreId");
