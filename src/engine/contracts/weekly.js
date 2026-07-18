import {
  CONTRACT_MARKET_WEEK_END,
  CONTRACT_MARKET_WEEK_START,
  CONTRACT_OFFER_TYPES,
  EXTENSION_YEARS_REMAINING,
  FREE_AGENCY_STATUS,
  MAX_RIVAL_OFFERS_PER_WEEK,
  RIVAL_OFFER_CHANCE,
} from '../../data/contracts'
import { SEASON_PHASES } from '../../data/season/constants'
import { TEAMS } from '../../data/teams'
import { resolveFranchiseObjective } from '../franchise/objective'
import {
  generateBuyoutOffer,
  generateFranchiseOffer,
  generateOptionOffer,
} from './offers.js'
import { tickCareerContract } from './resolve.js'
import {
  createContractEngineState,
  migrateLegacyContract,
  resolveFreeAgencyStatus,
} from './state.js'

/**
 * Pipeline semanal da Contract Engine (carreira do jogador).
 */
export function processWeeklyContracts(state, opts = {}) {
  const rng = opts.rng ?? Math.random
  const week = opts.week ?? state.currentWeek
  const seasonNumber = opts.seasonNumber ?? state.currentSeason
  const seasonRolled = Boolean(opts.seasonRolled)
  const phase = opts.phase ?? state.season?.phase ?? SEASON_PHASES.regular
  const messages = []

  let contract = migrateLegacyContract(state.contract, {
    teamId: state.currentTeamId,
    seasonsInLeague: state.currentSeason ?? 1,
  })
  let engine = createContractEngineState(state.contractEngine)
  let pendingOffer = state.pendingContractOffer ?? engine.pendingOffer
  let currentTeamId = state.currentTeamId

  // 1) Tick anual
  if (seasonRolled) {
    const tick = tickCareerContract(contract, state.player, true)
    contract = tick.contract
    messages.push(...tick.messages)
  }

  // Já existe oferta pendente — não gera outra
  if (pendingOffer) {
    return {
      contract,
      contractEngine: { ...engine, pendingOffer },
      pendingContractOffer: pendingOffer,
      currentTeamId,
      messages,
      summary: {
        pending: true,
        offerType: pendingOffer.type,
        freeAgencyStatus: contract.freeAgencyStatus,
      },
    }
  }

  const urgentFa =
    (contract.yearsRemaining ?? 0) <= 0 ||
    Boolean(contract.options?.playerOptionPending) ||
    Boolean(contract.options?.teamOptionPending)

  const inMarket =
    urgentFa ||
    phase === SEASON_PHASES.offseason ||
    phase === SEASON_PHASES.awards ||
    (week >= CONTRACT_MARKET_WEEK_START && week <= CONTRACT_MARKET_WEEK_END)

  const marketKey = `${seasonNumber}-${week}`
  if (engine.marketWeekProcessed === marketKey) {
    return {
      contract,
      contractEngine: engine,
      pendingContractOffer: null,
      currentTeamId,
      messages,
      summary: {
        pending: false,
        freeAgencyStatus: contract.freeAgencyStatus,
        skipped: 'already_processed',
      },
    }
  }

  // 2) Player / Team Option
  if (inMarket && contract.options?.teamOptionPending && contract.teamId) {
    const offer = generateOptionOffer({
      contract,
      player: state.player,
      kind: 'team_option',
      seasonNumber,
      week,
    })
    if (offer) {
      // Franquia decide automaticamente se oferece exercer (vira proposta ao jogador como aviso)
      // Para team option: a "oferta" é a decisão da franquia — se aceitar, 1 ano mais
      const obj = resolveFranchiseObjective(
        state.gm,
        contract.teamId,
        state.season,
      )
      const exercise =
        (state.player?.overall ?? 70) >= 78 &&
        obj.objectiveId !== 'tank' &&
        obj.objectiveId !== 'economy'

      if (exercise) {
        pendingOffer = offer
        messages.push('Team Option: a franquia quer exercer a opção.')
      } else {
        contract = {
          ...contract,
          options: { ...contract.options, teamOptionPending: false },
          yearsRemaining: 0,
          freeAgencyStatus: resolveFreeAgencyStatus(contract, state.player),
          weeklySalary: 0,
        }
        messages.push('Franquia declinou a Team Option — free agency.')
      }
    }
  }

  if (
    !pendingOffer &&
    inMarket &&
    contract.options?.playerOptionPending &&
    contract.teamId
  ) {
    pendingOffer = generateOptionOffer({
      contract,
      player: state.player,
      kind: 'player_option',
      seasonNumber,
      week,
    })
    if (pendingOffer) {
      messages.push('Player Option disponível — aceite ou recuse.')
    }
  }

  // 3) Buyout (economia / tank, contrato longo e caro)
  if (
    !pendingOffer &&
    inMarket &&
    contract.teamId &&
    (contract.yearsRemaining ?? 0) >= 2 &&
    (contract.yearlySalary ?? 0) >= 8_000_000
  ) {
    const obj = resolveFranchiseObjective(
      state.gm,
      contract.teamId,
      state.season,
    )
    if (
      (obj.objectiveId === 'economy' || obj.objectiveId === 'tank') &&
      rng() < 0.25
    ) {
      pendingOffer = generateBuyoutOffer({
        contract,
        player: state.player,
        seasonNumber,
        week,
        reason: `${obj.objective.label}: liberar teto salarial`,
      })
      if (pendingOffer) messages.push('Franquia propõe buyout.')
    }
  }

  // 4) Extensão / renovação com o time atual
  if (
    !pendingOffer &&
    inMarket &&
    contract.teamId &&
    (contract.yearsRemaining ?? 0) === EXTENSION_YEARS_REMAINING &&
    contract.freeAgencyStatus === FREE_AGENCY_STATUS.none
  ) {
    const obj = resolveFranchiseObjective(
      state.gm,
      contract.teamId,
      state.season,
    )
    const type =
      (contract.yearsRemaining ?? 0) > 0
        ? CONTRACT_OFFER_TYPES.extension
        : CONTRACT_OFFER_TYPES.renewal
    pendingOffer = generateFranchiseOffer({
      teamId: contract.teamId,
      player: state.player,
      contract,
      type,
      seasonNumber,
      week,
      relationships: state.relationships,
      franchiseObjective: obj.objectiveId,
      gm: state.gm,
      rng,
    })
    if (pendingOffer) {
      messages.push(
        type === CONTRACT_OFFER_TYPES.extension
          ? 'Proposta de extensão recebida.'
          : 'Proposta de renovação recebida.',
      )
    }
  }

  // 5) Free agency — RFA / UFA
  const isFA =
    (contract.yearsRemaining ?? 0) <= 0 ||
    contract.freeAgencyStatus === FREE_AGENCY_STATUS.rfa ||
    contract.freeAgencyStatus === FREE_AGENCY_STATUS.ufa

  if (!pendingOffer && inMarket && isFA) {
    const faStatus =
      contract.freeAgencyStatus === FREE_AGENCY_STATUS.none
        ? resolveFreeAgencyStatus(contract, state.player)
        : contract.freeAgencyStatus

    contract = { ...contract, freeAgencyStatus: faStatus }

    // Time atual (RFA qualificatória / interesse)
    const homeId = contract.teamId ?? state.currentTeamId
    if (homeId) {
      const obj = resolveFranchiseObjective(state.gm, homeId, state.season)
      pendingOffer = generateFranchiseOffer({
        teamId: homeId,
        player: state.player,
        contract,
        type:
          faStatus === FREE_AGENCY_STATUS.rfa
            ? CONTRACT_OFFER_TYPES.rfa_offer
            : CONTRACT_OFFER_TYPES.renewal,
        seasonNumber,
        week,
        relationships: state.relationships,
        franchiseObjective: obj.objectiveId,
        gm: state.gm,
        rng,
      })
      if (pendingOffer) {
        messages.push(
          faStatus === FREE_AGENCY_STATUS.rfa
            ? 'Oferta RFA do time atual.'
            : 'Oferta de retorno do time atual.',
        )
      }
    }

    // Rivais — só se o time atual não ofereceu (ou UFA com oferta melhor)
    if (!pendingOffer) {
      const rivals = pickRivalTeams(homeId, state, rng)
      for (const teamId of rivals) {
        if (pendingOffer) break
        if (rng() > RIVAL_OFFER_CHANCE) continue
        const obj = resolveFranchiseObjective(state.gm, teamId, state.season)
        const rivalOffer = generateFranchiseOffer({
          teamId,
          player: state.player,
          contract,
          type:
            faStatus === FREE_AGENCY_STATUS.rfa
              ? CONTRACT_OFFER_TYPES.rfa_offer
              : CONTRACT_OFFER_TYPES.ufa_offer,
          seasonNumber,
          week,
          relationships: state.relationships,
          franchiseObjective: obj.objectiveId,
          gm: state.gm,
          rng,
        })
        if (rivalOffer) {
          pendingOffer = rivalOffer
          messages.push(
            `Oferta ${faStatus === FREE_AGENCY_STATUS.rfa ? 'RFA' : 'UFA'}: ${rivalOffer.fromTeamShort}.`,
          )
        }
      }
    } else if (faStatus === FREE_AGENCY_STATUS.ufa) {
      // UFA: rival pode superar o time atual
      const rivals = pickRivalTeams(homeId, state, rng)
      for (const teamId of rivals) {
        if (rng() > RIVAL_OFFER_CHANCE) continue
        const obj = resolveFranchiseObjective(state.gm, teamId, state.season)
        const rivalOffer = generateFranchiseOffer({
          teamId,
          player: state.player,
          contract,
          type: CONTRACT_OFFER_TYPES.ufa_offer,
          seasonNumber,
          week,
          relationships: state.relationships,
          franchiseObjective: obj.objectiveId,
          gm: state.gm,
          rng,
        })
        if (
          rivalOffer &&
          rivalOffer.yearlySalary > (pendingOffer.yearlySalary ?? 0)
        ) {
          pendingOffer = rivalOffer
          messages.push(`Oferta UFA superior: ${rivalOffer.fromTeamShort}.`)
          break
        }
      }
    }
  }

  engine = {
    ...engine,
    pendingOffer,
    marketWeekProcessed: inMarket ? marketKey : engine.marketWeekProcessed,
  }

  return {
    contract,
    contractEngine: engine,
    pendingContractOffer: pendingOffer,
    currentTeamId,
    messages,
    summary: {
      pending: Boolean(pendingOffer),
      offerType: pendingOffer?.type ?? null,
      freeAgencyStatus: contract.freeAgencyStatus,
      yearsRemaining: contract.yearsRemaining,
      yearlySalary: contract.yearlySalary,
    },
  }
}

function pickRivalTeams(homeId, state, rng) {
  const pool = TEAMS.filter((t) => t.id !== homeId).sort(
    (a, b) => a.id.localeCompare(b.id),
  )
  // Determinístico + leve shuffle por rng
  const scored = pool.map((t, i) => ({
    id: t.id,
    score: i + rng() * 3,
  }))
  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, MAX_RIVAL_OFFERS_PER_WEEK).map((s) => s.id)
}
