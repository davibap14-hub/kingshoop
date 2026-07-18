import {
  EXPANSION_AFTER_SEASONS,
  EXPANSION_FRANCHISES,
} from '../../data/expansion'
import { listActiveTeamIds, syncLeagueTeams, TEAMS } from '../../data/teams'
import { runExpansionDraft } from './draft.js'
import { ensureGmForActiveLeague } from './ensure.js'
import {
  createExpansionState,
  markExpanded,
  pendingExpansionFranchises,
  shouldExpandLeague,
} from './state.js'

/**
 * Executa a onda de expansão (franquias + Expansion Draft + identidade).
 * Deve rodar no seasonRolled, antes do reset da Season Engine.
 */
export function applyLeagueExpansion({
  gm,
  expansion,
  previousSeasonNumber,
  newSeasonNumber,
  rng = Math.random,
} = {}) {
  const current = createExpansionState(expansion ?? {})
  // Garante registry alinhado ao save
  syncLeagueTeams(current.activeTeamIds)

  if (!shouldExpandLeague(current, previousSeasonNumber)) {
    return {
      ok: false,
      expanded: false,
      gm,
      expansion: {
        ...current,
        activeTeamIds: listActiveTeamIds(),
      },
      decisions: [],
      messages: [],
      draft: null,
    }
  }

  const franchises = pendingExpansionFranchises(current)
  if (!franchises.length) {
    return {
      ok: false,
      expanded: false,
      gm,
      expansion: current,
      decisions: [],
      messages: ['Expansion Engine: catálogo sem franquias pendentes.'],
      draft: null,
    }
  }

  const existingTeamIds = TEAMS.map((t) => t.id)
  const newIds = franchises.map((f) => f.id)

  // 1) Ativa franquias (identidade visual / arenas / uniformes no registry)
  syncLeagueTeams([...existingTeamIds, ...newIds])

  // 2) Expansion Draft
  let nextGm = ensureGmForActiveLeague(gm, {
    seasonNumber: newSeasonNumber,
  })
  const draft = runExpansionDraft(nextGm, newIds, { existingTeamIds })
  nextGm = ensureGmForActiveLeague(draft.gm, {
    seasonNumber: newSeasonNumber,
  })

  const expansionState = markExpanded(current, {
    seasonNumber: previousSeasonNumber,
    teamIds: newIds,
    draftLog: {
      seasonNumber: previousSeasonNumber,
      newSeasonNumber,
      teamIds: newIds,
      picks: draft.picks,
      faFills: draft.faFills ?? [],
      protectedByTeam: draft.protectedByTeam,
      afterSeasons: EXPANSION_AFTER_SEASONS,
      at: Date.now(),
    },
  })

  const decisions = [
    {
      type: 'expansion',
      teamIds: newIds,
      teamNames: franchises.map((f) => f.name),
      picks: draft.picks.length,
      reason: `Expansão da liga após ${EXPANSION_AFTER_SEASONS} temporadas`,
      calendarVersion: expansionState.calendarVersion,
      at: Date.now(),
    },
    ...draft.picks.map((p) => ({
      type: 'expansion_draft',
      teamId: p.teamId,
      playerId: p.playerId,
      playerName: p.playerName,
      fromTeamId: p.fromTeamId,
      pickNumber: p.pickNumber,
      overall: p.overall,
      posicao: p.posicao,
      reason: `Expansion Draft #${p.pickNumber}`,
      at: Date.now(),
    })),
  ]

  const messages = [
    `Expansion Engine: liga expande para ${TEAMS.length} franquias.`,
    ...franchises.map(
      (f) =>
        `${f.short} entra na ${f.conference} — arena ${f.arena.name}, cores ${f.colors.primary}.`,
    ),
    `Expansion Draft: ${draft.picks.length} seleção(ões)${
      draft.faFills?.length ? ` + ${draft.faFills.length} FA` : ''
    }. Novo calendário v${expansionState.calendarVersion}.`,
  ]

  // rng reservado para futuras ondas com variação
  void rng

  return {
    ok: true,
    expanded: true,
    gm: nextGm,
    expansion: expansionState,
    decisions,
    messages,
    draft: expansionState.lastExpansionDraft,
    franchises,
  }
}

export function listExpansionCatalog() {
  return EXPANSION_FRANCHISES.map((f) => ({ ...f }))
}
