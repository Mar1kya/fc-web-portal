/*
  Warnings:

  - You are about to drop the column `goalsConceded` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `goalsScored` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sofascoreId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sofascoreId]` on the table `Opponent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "MatchStatus" ADD VALUE 'CANCELED';

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "goalsConceded",
DROP COLUMN "goalsScored",
ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "homeScore" INTEGER,
ADD COLUMN     "opponentLineup" JSONB,
ADD COLUMN     "round" INTEGER,
ADD COLUMN     "sofascoreId" INTEGER,
ADD COLUMN     "startTimestamp" INTEGER;

-- AlterTable
ALTER TABLE "MatchEvent" ADD COLUMN     "customPlayerName" TEXT,
ADD COLUMN     "isOpponent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "playerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Opponent" ADD COLUMN     "sofascoreId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Match_sofascoreId_key" ON "Match"("sofascoreId");

-- CreateIndex
CREATE UNIQUE INDEX "Opponent_sofascoreId_key" ON "Opponent"("sofascoreId");
