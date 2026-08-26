import { SOFASCORE_TEAM_IDS, teamContextTranslations } from "@/lib/constants"
import { TeamContext } from "../../../generated/prisma"

export const TEAM_SWITCHER_CONTEXTS = Object.keys(
  SOFASCORE_TEAM_IDS
) as TeamContext[]

export const TEAM_SWITCHER_OPTIONS = TEAM_SWITCHER_CONTEXTS.map((value) => ({
  value,
  label: teamContextTranslations[value],
}))

const VALID_TEAM_CONTEXTS = new Set<TeamContext>(TEAM_SWITCHER_CONTEXTS)

export const DEFAULT_TEAM_CONTEXT: TeamContext = TeamContext.MAIN_TEAM

export function parseTeamContext(
  value: string | string[] | undefined
): TeamContext {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && VALID_TEAM_CONTEXTS.has(raw as TeamContext)) {
    return raw as TeamContext
  }
  return DEFAULT_TEAM_CONTEXT
}