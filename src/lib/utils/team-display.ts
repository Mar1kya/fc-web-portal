import { TeamContext } from "../../../generated/prisma";
import { SOFASCORE_TEAM_IDS, teamContextSuffixesUk } from "../constants";

type Translator = (key: string) => string;

export function getOurTeamName(
  baseTeamName: string,
  teamContext: TeamContext | undefined,
  tMatches: Translator,
): string {
  if (!teamContext) return baseTeamName;
  const suffix = tMatches(`teamSuffixes.${teamContext}`);
  return suffix ? `${baseTeamName} ${suffix}` : baseTeamName;
}

export function getOurLogoUrl(teamContext: TeamContext | undefined): string {
  const context = teamContext ?? TeamContext.MAIN_TEAM;
  const sofascoreId =
    SOFASCORE_TEAM_IDS[context] ?? SOFASCORE_TEAM_IDS[TeamContext.MAIN_TEAM];
  return `https://img.sofascore.com/api/v1/team/${sofascoreId}/image`;
}

export function getOurTeamNameAdmin(
  baseTeamName: string,
  teamContext: TeamContext | undefined,
): string {
  if (!teamContext) return baseTeamName;
  const suffix = teamContextSuffixesUk[teamContext];
  return suffix ? `${baseTeamName} ${suffix}` : baseTeamName;
}