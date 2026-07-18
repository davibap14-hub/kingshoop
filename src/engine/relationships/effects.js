import { EFFECT_THRESHOLDS } from '../../data/relationships'
import { createRelationshipsState } from './state.js'

/**
 * Calcula efeitos derivados dos relacionamentos.
 * Influencia: eventos, contratos, tempo de quadra, química,
 * patrocínios e evolução.
 */
export function calculateRelationshipEffects(relationships, context = {}) {
  const r = createRelationshipsState(relationships ?? {})
  const { high, low, criticalLow } = EFFECT_THRESHOLDS

  const coach = r.coach
  const gm = r.gm
  const teammates = r.teammates
  const fans = r.fans
  const press = r.press
  const sponsors = r.sponsors
  const agent = r.agent

  // Tempo de quadra (0.65–1.25) — coach + gm + leve torcida
  const minutesModifier = clampNum(
    0.85 +
      (coach - 50) * 0.004 +
      (gm - 50) * 0.0025 +
      (fans - 50) * 0.001,
    0.65,
    1.25,
  )

  // Química do elenco
  const chemistryBonus = clampNum((teammates - 50) * 0.35, -12, 14)

  // Evolução / treino / XP
  const trainingMultiplier = clampNum(
    1 + (coach - 50) * 0.003 + (agent - 50) * 0.001,
    0.75,
    1.2,
  )
  const xpMultiplier = clampNum(
    1 + (coach - 50) * 0.0025 + (teammates - 50) * 0.0015,
    0.8,
    1.18,
  )

  // Contratos
  const contractDemandFactor = clampNum(
    1 + (agent - 50) * 0.003 - (gm - 50) * 0.0015,
    0.9,
    1.2,
  )
  const renewWillingnessBonus = clampNum(
    (gm - 50) * 0.004 + (coach - 50) * 0.002 + (fans - 50) * 0.001,
    -0.2,
    0.25,
  )

  // Patrocínios
  const sponsorshipChanceBonus = clampNum(
    (sponsors - 50) * 0.004 + (press - 50) * 0.002,
    -0.2,
    0.3,
  )
  const sponsorshipPayMultiplier = clampNum(
    1 + (sponsors - 50) * 0.004 + (fans - 50) * 0.002,
    0.8,
    1.35,
  )

  // Eventos — pesos relativos
  const eventWeightMods = {
    treinador: coach >= high ? 1.15 : coach <= low ? 1.25 : 1,
    companheiros: teammates >= high ? 1.1 : teammates <= low ? 1.3 : 1,
    midia: press >= high ? 1.2 : press <= low ? 1.25 : 1,
    patrocinio: sponsors >= high ? 1.15 : sponsors <= low ? 1.2 : 1,
    torcedores: fans >= high ? 1.1 : fans <= low ? 1.3 : 1,
    nba: gm <= low ? 1.2 : 1,
  }

  // Humor / motivação passiva
  const motivationAura = Math.round(
    (coach + teammates + fans - 150) / 30,
  )

  const flags = {
    coachTrust: coach >= high,
    coachConflict: coach <= criticalLow,
    lockerRoomStrong: teammates >= high,
    lockerRoomToxic: teammates <= criticalLow,
    mediaDarling: press >= high,
    mediaHeat: press <= low,
    fanFavorite: fans >= high,
    gmAlly: gm >= high,
    gmTension: gm <= low,
    sponsorFriendly: sponsors >= high,
    agentAligned: agent >= high,
  }

  return {
    relationships: r,
    minutesModifier,
    playingTimeShare: Math.round(minutesModifier * 28), // minutos/jogo alvo
    chemistryBonus,
    trainingMultiplier,
    xpMultiplier,
    contractDemandFactor,
    renewWillingnessBonus,
    sponsorshipChanceBonus,
    sponsorshipPayMultiplier,
    eventWeightMods,
    motivationAura,
    flags,
    context: {
      week: context.week ?? null,
      seasonNumber: context.seasonNumber ?? null,
    },
  }
}

function clampNum(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
