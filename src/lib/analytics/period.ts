export type AnalyticsPeriod = "7d" | "30d" | "90d" | "12m" | "year" | "all";

export const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Останні 7 днів" },
  { value: "30d", label: "Останні 30 днів" },
  { value: "90d", label: "Останні 90 днів" },
  { value: "12m", label: "Останні 12 місяців" },
  { value: "year", label: "Поточний рік" },
  { value: "all", label: "Весь час" },
];

export const DEFAULT_ANALYTICS_PERIOD: AnalyticsPeriod = "7d";

const VALID_PERIODS = new Set<AnalyticsPeriod>(
  PERIOD_OPTIONS.map((o) => o.value)
);

export function parseAnalyticsPeriod(
  value: string | string[] | undefined
): AnalyticsPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && VALID_PERIODS.has(raw as AnalyticsPeriod)) {
    return raw as AnalyticsPeriod;
  }
  return DEFAULT_ANALYTICS_PERIOD;
}


export function getPeriodStartDate(period: AnalyticsPeriod): Date | null {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  switch (period) {
    case "7d":
      start.setUTCDate(start.getUTCDate() - 7);
      return start;
    case "30d":
      start.setUTCDate(start.getUTCDate() - 30);
      return start;
    case "90d":
      start.setUTCDate(start.getUTCDate() - 90);
      return start;
    case "12m":
      start.setUTCMonth(start.getUTCMonth() - 11); 
      start.setUTCDate(1);
      return start;
    case "year":
      return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    case "all":
      return null;
  }
}


export type TimeGranularity = "day" | "month";

export function getGranularityForPeriod(
  period: AnalyticsPeriod
): TimeGranularity {
  switch (period) {
    case "7d":
    case "30d":
    case "90d":
      return "day";
    case "12m":
    case "year":
    case "all":
      return "month";
  }
}