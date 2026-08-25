import { prisma } from "@/lib/prisma";
import { Season, Tournament } from "../../../generated/prisma";

type SofascoreSeasonRow = {
  id: number;
  name: string;
  year: string;
};


function yearMatchesSeason(year: string, season: Season): boolean {
  const startFull = season.startDate.getFullYear();
  const endFull = season.endDate.getFullYear();
  const startShort = startFull.toString().slice(-2);
  const endShort = endFull.toString().slice(-2);

  const candidates = new Set([
    `${startShort}/${endShort}`, 
    `${startFull}/${endFull}`, 
    `${startFull}`,
    `${endFull}`, 
  ]);

  return candidates.has(year.trim());
}

export async function resolveSofascoreSeasonId(
  tournament: Pick<Tournament, "id" | "slug" | "sofascoreId">,
  season: Season,
): Promise<{ sofascoreSeasonId: number; year: string } | null> {
  if (!tournament.sofascoreId) return null;

  const response = await fetch(
    `https://sofascore.p.rapidapi.com/tournaments/get-seasons?tournamentId=${tournament.sofascoreId}`,
    {
      headers: {
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      `[season-resolver] HTTP ${response.status} для get-seasons турніру ${tournament.slug}`,
    );
    return null;
  }

  const data = await response.json();
  const seasons: SofascoreSeasonRow[] = data.seasons || [];

  if (seasons.length === 0) {
    console.error(`[season-resolver] Порожній список сезонів для ${tournament.slug}`);
    return null;
  }

  const match = seasons.find((s) => yearMatchesSeason(s.year, season));

  if (!match) {
    console.error(
      `[season-resolver] Не знайдено сезон для ${tournament.slug} (шукали під ${season.name}). Доступні: ${seasons
        .slice(0, 5)
        .map((s) => s.year)
        .join(", ")}`,
    );
    return null;
  }

  return { sofascoreSeasonId: match.id, year: match.year };
}

export async function resolveAndSaveTournamentSeason(
  tournament: Pick<Tournament, "id" | "slug" | "sofascoreId">,
  season: Season,
) {
  const resolved = await resolveSofascoreSeasonId(tournament, season);
  if (!resolved) return null;

  return prisma.tournamentSeason.upsert({
    where: {
      tournamentId_seasonId: {
        tournamentId: tournament.id,
        seasonId: season.id,
      },
    },
    create: {
      tournamentId: tournament.id,
      seasonId: season.id,
      sofascoreSeasonId: resolved.sofascoreSeasonId,
    },
    update: {
      sofascoreSeasonId: resolved.sofascoreSeasonId,
    },
  });
}