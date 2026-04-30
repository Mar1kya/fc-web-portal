-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "initialCleanSheets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "initialGoalsConceded" INTEGER NOT NULL DEFAULT 0;
