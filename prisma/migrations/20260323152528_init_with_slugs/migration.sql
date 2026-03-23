-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('NEWS', 'INTERVIEW', 'STATEMENT');

-- CreateEnum
CREATE TYPE "TeamContext" AS ENUM ('MAIN_TEAM', 'U19', 'ACADEMY', 'GENERAL');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION_IN', 'SUBSTITUTION_OUT');

-- CreateEnum
CREATE TYPE "OrderStatusEnum" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTranslation" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "altText" TEXT NOT NULL,

    CONSTRAINT "MediaTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'NEWS',
    "teamContext" "TeamContext" NOT NULL DEFAULT 'GENERAL',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "PostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "matchId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryTranslation" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "GalleryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "teamContext" "TeamContext" NOT NULL DEFAULT 'MAIN_TEAM',
    "avatar" TEXT,
    "birthDate" TIMESTAMP(3),
    "height" INTEGER,
    "weight" INTEGER,
    "nationality" VARCHAR(10),
    "initialMatches" INTEGER NOT NULL DEFAULT 0,
    "initialGoals" INTEGER NOT NULL DEFAULT 0,
    "initialAssists" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTranslation" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "PlayerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatar" TEXT,
    "teamContext" "TeamContext" NOT NULL DEFAULT 'MAIN_TEAM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachTranslation" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "CoachTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opponent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,

    CONSTRAINT "Opponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpponentTranslation" (
    "id" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OpponentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTranslation" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TournamentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standing" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamLogo" TEXT,
    "points" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "win" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lose" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalsDiff" INTEGER NOT NULL,
    "tournamentId" TEXT,
    "seasonId" TEXT,
    "teamContext" "TeamContext" NOT NULL DEFAULT 'MAIN_TEAM',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "teamContext" "TeamContext" NOT NULL DEFAULT 'MAIN_TEAM',
    "tournamentId" TEXT,
    "seasonId" TEXT,
    "opponentId" TEXT NOT NULL,
    "isHomeGame" BOOLEAN NOT NULL DEFAULT true,
    "stadium" TEXT,
    "goalsScored" INTEGER,
    "goalsConceded" INTEGER,
    "highlightsUrl" TEXT,
    "fullMatchUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLineup" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchLineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "minute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "sizes" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "OrderStatusEnum" NOT NULL DEFAULT 'PENDING',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "size" TEXT,
    "fixedPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MediaToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToPlayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MediaToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GalleryToMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GalleryToMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlayerToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlayerToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlayerToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlayerToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoachToMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoachToMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoachToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoachToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTranslation_mediaId_language_key" ON "MediaTranslation"("mediaId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_deletedAt_idx" ON "Post"("deletedAt");

-- CreateIndex
CREATE INDEX "PostTranslation_language_idx" ON "PostTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "PostTranslation_postId_language_key" ON "PostTranslation"("postId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_slug_key" ON "Gallery"("slug");

-- CreateIndex
CREATE INDEX "Gallery_deletedAt_idx" ON "Gallery"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTranslation_galleryId_language_key" ON "GalleryTranslation"("galleryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE INDEX "Player_deletedAt_idx" ON "Player"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTranslation_playerId_language_key" ON "PlayerTranslation"("playerId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_slug_key" ON "Coach"("slug");

-- CreateIndex
CREATE INDEX "Coach_deletedAt_idx" ON "Coach"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoachTranslation_coachId_language_key" ON "CoachTranslation"("coachId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Opponent_slug_key" ON "Opponent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OpponentTranslation_opponentId_language_key" ON "OpponentTranslation"("opponentId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_deletedAt_idx" ON "Tournament"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTranslation_tournamentId_language_key" ON "TournamentTranslation"("tournamentId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");

-- CreateIndex
CREATE INDEX "Match_deletedAt_idx" ON "Match"("deletedAt");

-- CreateIndex
CREATE INDEX "Match_seasonId_idx" ON "Match"("seasonId");

-- CreateIndex
CREATE INDEX "Match_teamContext_idx" ON "Match"("teamContext");

-- CreateIndex
CREATE UNIQUE INDEX "MatchLineup_matchId_playerId_key" ON "MatchLineup"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "MatchEvent_playerId_idx" ON "MatchEvent"("playerId");

-- CreateIndex
CREATE INDEX "MatchEvent_type_idx" ON "MatchEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_language_key" ON "CategoryTranslation"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_productId_language_key" ON "ProductTranslation"("productId", "language");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_slug_key" ON "Season"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE INDEX "Season_deletedAt_idx" ON "Season"("deletedAt");

-- CreateIndex
CREATE INDEX "_MediaToPost_B_index" ON "_MediaToPost"("B");

-- CreateIndex
CREATE INDEX "_MediaToPlayer_B_index" ON "_MediaToPlayer"("B");

-- CreateIndex
CREATE INDEX "_MediaToProduct_B_index" ON "_MediaToProduct"("B");

-- CreateIndex
CREATE INDEX "_GalleryToMedia_B_index" ON "_GalleryToMedia"("B");

-- CreateIndex
CREATE INDEX "_PlayerToPost_B_index" ON "_PlayerToPost"("B");

-- CreateIndex
CREATE INDEX "_PlayerToProduct_B_index" ON "_PlayerToProduct"("B");

-- CreateIndex
CREATE INDEX "_CoachToMedia_B_index" ON "_CoachToMedia"("B");

-- CreateIndex
CREATE INDEX "_CoachToPost_B_index" ON "_CoachToPost"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTranslation" ADD CONSTRAINT "MediaTranslation_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTranslation" ADD CONSTRAINT "PostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryTranslation" ADD CONSTRAINT "GalleryTranslation_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTranslation" ADD CONSTRAINT "PlayerTranslation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachTranslation" ADD CONSTRAINT "CoachTranslation_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpponentTranslation" ADD CONSTRAINT "OpponentTranslation_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTranslation" ADD CONSTRAINT "TournamentTranslation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Opponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPost" ADD CONSTRAINT "_MediaToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPost" ADD CONSTRAINT "_MediaToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPlayer" ADD CONSTRAINT "_MediaToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToPlayer" ADD CONSTRAINT "_MediaToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToProduct" ADD CONSTRAINT "_MediaToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToProduct" ADD CONSTRAINT "_MediaToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GalleryToMedia" ADD CONSTRAINT "_GalleryToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GalleryToMedia" ADD CONSTRAINT "_GalleryToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToPost" ADD CONSTRAINT "_PlayerToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToPost" ADD CONSTRAINT "_PlayerToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToProduct" ADD CONSTRAINT "_PlayerToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToProduct" ADD CONSTRAINT "_PlayerToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToMedia" ADD CONSTRAINT "_CoachToMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToMedia" ADD CONSTRAINT "_CoachToMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToPost" ADD CONSTRAINT "_CoachToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachToPost" ADD CONSTRAINT "_CoachToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
