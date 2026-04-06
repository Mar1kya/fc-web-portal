-- CreateTable
CREATE TABLE "TeamDictionary" (
    "id" TEXT NOT NULL,
    "sofascoreId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamDictionary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamDictionaryTranslation" (
    "id" TEXT NOT NULL,
    "teamDictionaryId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TeamDictionaryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamDictionary_sofascoreId_key" ON "TeamDictionary"("sofascoreId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamDictionaryTranslation_teamDictionaryId_language_key" ON "TeamDictionaryTranslation"("teamDictionaryId", "language");

-- AddForeignKey
ALTER TABLE "TeamDictionaryTranslation" ADD CONSTRAINT "TeamDictionaryTranslation_teamDictionaryId_fkey" FOREIGN KEY ("teamDictionaryId") REFERENCES "TeamDictionary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
