/*
  Warnings:

  - A unique constraint covering the columns `[sofascoreId]` on the table `Coach` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sofascoreId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "sofascoreId" INTEGER;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "sofascoreId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Coach_sofascoreId_key" ON "Coach"("sofascoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_sofascoreId_key" ON "Player"("sofascoreId");
