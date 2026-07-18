import {
  DEFAULT_CAREER_STATUS,
  CAREER_STATUS,
  CAREER_STATUS_KEYS,
  WEEKS_PER_SEASON,
} from '../../data/constants/career'
import { DEFAULT_ARCHETYPE_ID, ARCHETYPES } from '../../data/constants/archetypes'
import { DEFAULT_TEAM_ID } from '../../data/teams'
import { ATTRIBUTE_GROUPS } from '../../data/players/schema'
import { calcOverall, normalizePlayer } from '../../data/players/utils'
import { calcPatrimonio, createFinanceState } from '../finance/state'
import {
  createEmptyCareerStats,
  createEmptyHistory,
} from '../save/history'
import { calcBalancedSalary } from '../balance'
import {
  createContractEngineState,
  createPlayerContract,
} from '../contracts'
import { createLeagueHistory } from '../history/state'
import {
  calculateRelationshipEffects,
  createRelationshipsState,
  hydrateRelationshipsFromStatus,
} from '../relationships'
import { createGmState } from '../gm/state'
import {
  createInjuryEngineState,
  hydrateInjuryEngine,
} from '../injuries/state.js'
import { createSeasonState } from '../season/state'
import { createProgressionState } from '../progression/xp'
import { clamp } from '../utils/math'

export function buildStatsFromArchetype(archetypeId = DEFAULT_ARCHETYPE_ID) {
  const arch = ARCHETYPES[archetypeId] ?? ARCHETYPES[DEFAULT_ARCHETYPE_ID]
  const base = arch.baseStats

  // Expande stats simples do arquétipo para o schema detalhado do banco.
  return normalizePlayer({
    id: 'career_player',
    nome: 'Rookie',
    idade: 19,
    posicao: 'SG',
    arquetipo: arch.id,
    fisico: {
      velocidade: base.fisico,
      impulsao: base.fisico - 2,
      forca: base.fisico - 4,
      resistencia: base.fisico + 2,
    },
    arremesso: {
      bandeja: base.arremesso,
      midRange: base.arremesso - 2,
      tresPontos: base.arremesso,
      lanceLivre: base.arremesso + 4,
    },
    defesa: {
      perimetro: base.defesa,
      garrafao: base.defesa - 6,
      roubo: base.defesa - 2,
      toco: Math.max(20, base.defesa - 20),
    },
    qi: {
      passe: base.inteligencia,
      visao: base.inteligencia - 2,
      tomadaDecisao: base.inteligencia,
    },
    potencial: Math.min(99, Math.round((base.fisico + base.arremesso + base.defesa + base.inteligencia) / 4) + 12),
    popularidade: 20,
    valorMercado: 5_000_000,
    salario: 1_500_000,
  })
}

export function createDefaultContract(teamId = DEFAULT_TEAM_ID, yearlySalary = 1_500_000) {
  return createPlayerContract({
    teamId,
    yearsRemaining: 3,
    yearsTotal: 3,
    yearlySalary,
    weeklySalary: Math.round(yearlySalary / WEEKS_PER_SEASON),
    seasonsWithTeam: 1,
    seasonsInLeague: 1,
    birdRights: true,
  })
}

/**
 * Estado inicial completo da Career Engine.
 */
export function createCareerState(overrides = {}) {
  const archetypeId = overrides.archetypeId ?? DEFAULT_ARCHETYPE_ID
  const player = overrides.player ?? buildStatsFromArchetype(archetypeId)
  const statusSeed = {
    ...DEFAULT_CAREER_STATUS,
    popularidade: player.popularidade ?? DEFAULT_CAREER_STATUS.popularidade,
    ...(overrides.status ?? {}),
  }
  const relationships = overrides.relationships
    ? createRelationshipsState(overrides.relationships)
    : hydrateRelationshipsFromStatus(statusSeed)
  const relationshipEffects =
    overrides.relationshipEffects ??
    calculateRelationshipEffects(relationships)

  return {
    playerName: overrides.playerName ?? player.nome ?? 'Rookie',
    archetypeId,
    player,
    // compat UI antiga (médias por grupo)
    playerStats: overrides.playerStats ?? {
      fisico: Math.round(
        (player.fisico.velocidade +
          player.fisico.impulsao +
          player.fisico.forca +
          player.fisico.resistencia) /
          4,
      ),
      arremesso: Math.round(
        (player.arremesso.bandeja +
          player.arremesso.midRange +
          player.arremesso.tresPontos +
          player.arremesso.lanceLivre) /
          4,
      ),
      defesa: Math.round(
        (player.defesa.perimetro +
          player.defesa.garrafao +
          player.defesa.roubo +
          player.defesa.toco) /
          4,
      ),
      inteligencia: Math.round(
        (player.qi.passe + player.qi.visao + player.qi.tomadaDecisao) / 3,
      ),
    },
    status: statusSeed,
    // aliases legados
    careerVariables: null, // preenchido abaixo
    progression: createProgressionState(overrides.progression),
    finance: (() => {
      const finance = createFinanceState(overrides.finance)
      const cash =
        overrides.status?.dinheiro ??
        DEFAULT_CAREER_STATUS.dinheiro
      return {
        ...finance,
        patrimonio:
          overrides.finance?.patrimonio ??
          calcPatrimonio(cash, finance.investments),
      }
    })(),
    contract:
      overrides.contract ??
      createDefaultContract(
        overrides.currentTeamId ?? DEFAULT_TEAM_ID,
        calcBalancedSalary(player, {
          seasonNumber: overrides.currentSeason ?? 1,
        }),
      ),
    contractEngine:
      overrides.contractEngine ?? createContractEngineState(),
    pendingContractOffer: overrides.pendingContractOffer ?? null,
    sponsorships: overrides.sponsorships ?? [],
    injury: overrides.injury ?? null,
    injuryEngine: hydrateInjuryEngine(
      overrides.injuryEngine ?? createInjuryEngineState(),
      overrides.injury ?? null,
    ),
    pendingEvent: overrides.pendingEvent ?? null,
    lastEventResult: overrides.lastEventResult ?? null,
    currentWeek: overrides.currentWeek ?? 1,
    currentSeason: overrides.currentSeason ?? 1,
    currentTeamId: overrides.currentTeamId ?? DEFAULT_TEAM_ID,
    lastEvent: overrides.lastEvent ?? 'Bem-vindo à carreira. Escolha uma atividade para a Semana 1.',
    lastWeekResult: overrides.lastWeekResult ?? null,
    weekNews: overrides.weekNews ?? [],
    newsFeed: overrides.newsFeed ?? [],
    history: overrides.history ?? createEmptyHistory(),
    careerStats: overrides.careerStats ?? createEmptyCareerStats(),
    leagueHistory: createLeagueHistory(overrides.leagueHistory),
    relationships,
    relationshipEffects,
    playingTimeShare:
      overrides.playingTimeShare ?? relationshipEffects.playingTimeShare,
    season:
      overrides.season ??
      createSeasonState({
        seasonNumber: overrides.currentSeason ?? 1,
      }),
    gm: overrides.gm ?? createGmState(),
  }
}

/** Sincroniza aliases legados (fama/quimica/dinheiro) a partir de status. */
export function syncLegacyCareerVariables(status) {
  return {
    energia: status.energia,
    dinheiro: status.dinheiro,
    fama: status.popularidade,
    quimica: status.relCompanheiros,
    motivacao: status.motivacao,
    popularidade: status.popularidade,
    relTreinador: status.relTreinador,
    relCompanheiros: status.relCompanheiros,
  }
}

export function applyStatusDeltas(status, deltas = {}) {
  const next = { ...status }

  for (const key of CAREER_STATUS_KEYS) {
    if (deltas[key] == null) continue
    const meta = CAREER_STATUS[key]
    next[key] = clamp(Math.round((next[key] ?? 0) + deltas[key]), meta.min, meta.max)
  }

  return next
}

export function syncPlayerStatsFromDetailed(player) {
  return {
    fisico: Math.round(
      (player.fisico.velocidade +
        player.fisico.impulsao +
        player.fisico.forca +
        player.fisico.resistencia) /
        4,
    ),
    arremesso: Math.round(
      (player.arremesso.bandeja +
        player.arremesso.midRange +
        player.arremesso.tresPontos +
        player.arremesso.lanceLivre) /
        4,
    ),
    defesa: Math.round(
      (player.defesa.perimetro +
        player.defesa.garrafao +
        player.defesa.roubo +
        player.defesa.toco) /
        4,
    ),
    inteligencia: Math.round(
      (player.qi.passe + player.qi.visao + player.qi.tomadaDecisao) / 3,
    ),
  }
}

export function recomputePlayerOverall(player) {
  return { ...player, overall: calcOverall(player) }
}

export { ATTRIBUTE_GROUPS }
