import { PlayerPosition } from "../../../generated/prisma";

export function mapSofaPosition(
  sofaPosition: string | null | undefined,
): PlayerPosition {
  switch ((sofaPosition || "").toUpperCase()) {
    case "G":
      return PlayerPosition.GOALKEEPER;
    case "D":
      return PlayerPosition.DEFENDER;
    case "M":
      return PlayerPosition.MIDFIELDER;
    case "F":
      return PlayerPosition.FORWARD;
    default:
      return PlayerPosition.MIDFIELDER;
  }
}

export type SofaRawPlayer = {
  id: number;
  name: string;
  position?: string | null;
  jerseyNumber?: string | number | null;
  height?: number | null;
  dateOfBirthTimestamp?: number | null;
  country?: { alpha3?: string | null } | null;
};

export function sofaJerseyNumberToInt(
  jerseyNumber: string | number | null | undefined,
): number | null {
  if (jerseyNumber === null || jerseyNumber === undefined) return null;
  const n =
    typeof jerseyNumber === "number" ? jerseyNumber : parseInt(jerseyNumber, 10);
  return Number.isFinite(n) ? n : null;
}

export function sofaBirthDate(
  timestamp: number | null | undefined,
): Date | null {
  return timestamp ? new Date(timestamp * 1000) : null;
}

export function sofaAvatarUrl(sofascoreId: number): string {
  return `https://img.sofascore.com/api/v1/player/${sofascoreId}/image`;
}