import { playerDb } from '../../data/players'
import { getTeamById, TEAMS } from '../../data/teams'
import { chooseBestStyle } from '../ai'
import {
  buildLineupChemistryEffects,
  createChemistryState,
} from '../chemistry'
import { decideTeamStyle } from '../coaches/decide.js'
import { getTeamCoach } from '../coaches/state.js'
import { ensureLeaguePlaybooks } from '../playbook/generate.js'
import {
  createPlaybookEngineState,
  getTeamPlaybook,
} from '../playbook/state.js'
import { calcRosterChemistry } from '../personality/chemistry'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

/**
 * Resolve jogadores de um elenco GM (ids) para objetos.
 */
function resolveRosterPlayers(rosterIds = [], gm = null) {
  return rosterIds
    .map(
      (id) =>
        playerDb.getById(id) ??
        (gm?.extraPlayers ?? []).find((p) => p.id === id) ??
        null,
    )
    .filter(Boolean)
}

/**
 * Monta um quinteto.
 * Se `gm` for passado, usa o elenco da franquia + Chemistry Engine.
 */
export function buildLineupFromDb(
  teamId,
  { excludeIds = [], styleId, gm = null, chemistryBonus = 0 } = {},
) {
  const excluded = new Set(excludeIds)
  const lineup = []
  const rosterIds = gm?.rosters?.[teamId] ?? null
  const rosterPool = rosterIds
    ? resolveRosterPlayers(rosterIds, gm).filter((p) => !excluded.has(p.id))
    : null

  for (const pos of POSITIONS) {
    const pool = rosterPool ?? playerDb.getByPosition(pos)
    const pick = (rosterPool
      ? pool.filter((p) => p.posicao === pos)
      : pool.filter((p) => !excluded.has(p.id))
    ).sort((a, b) => b.overall - a.overall)[0]

    if (pick) {
      lineup.push(pick)
      excluded.add(pick.id)
    }
  }

  while (lineup.length < 5) {
    const pool = rosterPool
      ? rosterPool.filter((p) => !excluded.has(p.id))
      : playerDb.getAll().filter((p) => !excluded.has(p.id))
    const next = [...pool].sort((a, b) => b.overall - a.overall)[0]
    if (!next) break
    lineup.push(next)
    excluded.add(next.id)
  }

  // Fallback global se elenco incompleto
  while (lineup.length < 5) {
    const next = playerDb
      .getAll()
      .filter((p) => !excluded.has(p.id))
      .sort((a, b) => b.overall - a.overall)[0]
    if (!next) break
    lineup.push(next)
    excluded.add(next.id)
  }

  const team = getTeamById(teamId) ?? TEAMS[0]

  const chemistryState = createChemistryState(gm?.chemistry ?? {})
  const chemistryEffects = buildLineupChemistryEffects(
    chemistryState,
    lineup,
    chemistryBonus,
  )
  // Scalar de compat: pares da Chemistry Engine (fallback personalidade)
  const chemistry =
    chemistryEffects.teamChemistry ??
    calcRosterChemistry(lineup, chemistryBonus)

  const coach = getTeamCoach(gm?.coaches, teamId)
  const ai = styleId
    ? { styleId, auto: false, setBias: coach?.setBias ?? {} }
    : coach
      ? decideTeamStyle(coach, lineup)
      : chooseBestStyle(lineup)

  const playbooks = ensureLeaguePlaybooks(
    createPlaybookEngineState(gm?.playbooks ?? {}),
    { coaches: gm?.coaches },
  ).state
  const playbook = getTeamPlaybook(playbooks, teamId)

  return {
    teamId: team.id,
    teamName: team.name,
    teamShort: team.short,
    team,
    players: lineup,
    chemistry,
    chemistryBonus,
    chemistryState: chemistryEffects.state,
    chemistryEffects,
    coach,
    coachSetBias: coach?.setBias ?? ai.setBias ?? {},
    defenseBias: coach?.defenseBias ?? null,
    playbook,
    fatigue: 0,
    styleId: ai.styleId,
  }
}

/**
 * Dois times distintos para uma partida de teste.
 */
export function buildDefaultMatchup(homeTeamId = 'gsw', awayTeamId = 'bos', gm = null) {
  const home = buildLineupFromDb(homeTeamId, { gm })
  const away = buildLineupFromDb(awayTeamId, {
    excludeIds: home.players.map((p) => p.id),
    gm,
  })
  return { home, away }
}
