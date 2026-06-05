import { NextResponse } from "next/server";
import { executeStandingsSync } from "@/actions/standings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManualTest = key === process.env.CRON_SECRET;

  if (!isVercelCron && !isManualTest) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await executeStandingsSync();

  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }
}