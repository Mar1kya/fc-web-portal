import { NextResponse } from "next/server";
import { executeRosterSync } from "@/actions/team";
import { SOFASCORE_TEAM_IDS } from "@/lib/constants";
import { TeamContext } from "../../../../../generated/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const contextParam = searchParams.get("context");
  const authHeader = request.headers.get("authorization");

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTest = key === process.env.CRON_SECRET;

  if (!isVercelCron && !isManualTest) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const contexts = contextParam
    ? [contextParam as TeamContext]
    : (Object.keys(SOFASCORE_TEAM_IDS) as TeamContext[]);

  const results = await Promise.all(
    contexts.map(async (ctx) => ({ context: ctx, ...(await executeRosterSync(ctx)) })),
  );

  const hasFailure = results.some((r) => !r.success);
  return NextResponse.json({ results }, { status: hasFailure ? 207 : 200 });
}