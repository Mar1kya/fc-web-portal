import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type RateLimitResult = {
  allowed: boolean;
  retryAfterMs?: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || now.getTime() - existing.windowStart.getTime() > windowMs) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    const retryAfterMs =
      windowMs - (now.getTime() - existing.windowStart.getTime());
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: true };
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function formatRetryAfter(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes} хв ${seconds} с`;
  return `${seconds} с`;
}
