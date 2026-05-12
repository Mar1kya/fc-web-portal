-- CreateTable
CREATE TABLE "_MatchToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MatchToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MatchToPost_B_index" ON "_MatchToPost"("B");

-- AddForeignKey
ALTER TABLE "_MatchToPost" ADD CONSTRAINT "_MatchToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToPost" ADD CONSTRAINT "_MatchToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
