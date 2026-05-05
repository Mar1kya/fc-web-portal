import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MatchStatus } from "../../../../../generated/prisma";
import { processMatchSync } from "@/lib/services/match-details.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTest = key === process.env.CRON_SECRET;

  if (!isVercelCron && !isManualTest) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const unsyncedMatches = await prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
        isDetailsSynced: false,
      },
      select: { id: true, slug: true },
    });

    if (unsyncedMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "No unsynced finished matches found. Everything is up to date.",
        processedCount: 0,
      });
    }

    console.log(
      `Found ${unsyncedMatches.length} unsynced matches. Starting sync...`,
    );

    let successCount = 0;
    let failedCount = 0;

    for (const match of unsyncedMatches) {
      console.log(`Syncing details for match: ${match.slug}`);
      const result = await processMatchSync(match.id);

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        console.error(`Failed to sync ${match.slug}:`, result.error);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      message: "Sync details completed",
      totalFound: unsyncedMatches.length,
      successCount,
      failedCount,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Cron Details Sync Error:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
