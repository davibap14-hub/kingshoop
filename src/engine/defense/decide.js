import {
  DEFENSE_SCHEMES,
  SCHEME_VS_OFFENSE,
} from '../../data/defense/constants.js'
import { DECISION_IDS } from '../../data/decision'
import { decide } from '../decision/decide.js'
import { combineScore } from '../simulation/weights'
import { resolveCoachDefenseBias } from './preferences.js'
import { readOffensiveThreat } from './threat.js'
import { buildDefenseEffects } from './effects.js'

/**
 * Escolhe o esquema defensivo coletivo para a posse.
 * Reage dinamicamente à ameaça ofensiva + preferências do coach.
 */
export function decideDefensiveScheme({
  defensePlayers = [],
  offensePlayers = [],
  ballHandler = null,
  ctx = {},
  coach = null,
  defenseBias = null,
  offensiveSet = null,
  rng = Math.random,
} = {}) {
  const bias = clampBias(defenseBias ?? resolveCoachDefenseBias(coach))
  const threat = readOffensiveThreat({
    ballHandler,
    offensePlayers,
    ctx,
    offensiveSet,
  })

  const vsSet = SCHEME_VS_OFFENSE[threat.likelySet] ?? []
  const lateClock =
    (threat.timeRemaining ?? 1) < 0.22 ||
    (threat.quarter >= 4 && (threat.timeRemaining ?? 1) < 0.35)
  const trailing = (threat.scoreDiff ?? 0) < -6
  const leading = (threat.scoreDiff ?? 0) > 10
  const highFatigue = (threat.fatigue ?? 0) >= 70

  const options = DEFENSE_SCHEMES.map((scheme) => {
    let situational = 50

    // Matchup vs set ofensivo previsto / real
    if (vsSet.includes(scheme)) situational += 22
    if (vsSet[0] === scheme) situational += 10

    // Transição → press
    if (threat.transition && scheme === 'full_court_press') situational += 28
    if (!threat.transition && scheme === 'full_court_press') situational -= 35

    // PnR coverages
    if (
      threat.likelySet === 'pick_and_roll' &&
      ['drop_coverage', 'hedge', 'switch', 'ice'].includes(scheme)
    ) {
      situational += 12
    }

    // Iso / criador → individual ou double
    if (threat.isoThreat >= 70 && scheme === 'individual') situational += 14
    if (threat.isoThreat >= 75 && scheme === 'double_team') situational += 10

    // Post → double / help / zone
    if (threat.postThreat >= 68 && ['double_team', 'help_defense', 'zone'].includes(scheme)) {
      situational += 12
    }

    // Muitos shooters → switch (não zona)
    if (threat.threeThreat >= 70 && scheme === 'switch') situational += 14
    if (threat.threeThreat >= 70 && scheme === 'zone') situational -= 18
    if (threat.threeThreat >= 70 && scheme === 'drop_coverage') situational -= 8

    // Placares / relógio
    if (trailing && ['trap', 'full_court_press', 'double_team'].includes(scheme)) {
      situational += 16
    }
    if (leading && ['drop_coverage', 'zone', 'individual'].includes(scheme)) {
      situational += 10
    }
    if (lateClock && ['trap', 'double_team', 'individual'].includes(scheme)) {
      situational += 12
    }

    // Fadiga: esquemas caros caem
    if (highFatigue && ['full_court_press', 'trap', 'hedge'].includes(scheme)) {
      situational -= 20
    }
    if (highFatigue && ['zone', 'drop_coverage'].includes(scheme)) {
      situational += 12
    }

    // Importância alta → disciplina (menos gamble)
    if ((threat.importance ?? 50) >= 80 && ['trap', 'full_court_press'].includes(scheme)) {
      situational -= 8
    }
    if ((threat.importance ?? 50) >= 80 && ['individual', 'help_defense'].includes(scheme)) {
      situational += 8
    }

    // Elenco: bigs ajudam drop/zone; guards ajudam press/switch
    const bigs = defensePlayers.filter((p) => p.posicao === 'C' || p.posicao === 'PF').length
    const guards = defensePlayers.filter((p) => p.posicao === 'PG' || p.posicao === 'SG').length
    if (bigs >= 2 && ['drop_coverage', 'zone', 'help_defense'].includes(scheme)) {
      situational += 8
    }
    if (guards >= 2 && ['full_court_press', 'switch', 'ice'].includes(scheme)) {
      situational += 8
    }

    const coachPref = bias[scheme] ?? 50
    const system = coach?.defensiveSystem ?? 55

    const score = combineScore([
      { value: coachPref, weight: 1.15 },
      { value: situational, weight: 1.05 },
      { value: system, weight: scheme === 'individual' || scheme === 'help_defense' ? 0.55 : 0.4 },
      { value: threat.pressure, weight: ['trap', 'double_team', 'full_court_press'].includes(scheme) ? 0.35 : 0.15 },
    ])

    return { id: scheme, score, scheme }
  })

  const result = decide(DECISION_IDS.defensive_scheme, options, ctx, rng)
  const scheme = result.choice?.id ?? 'individual'
  const effects = buildDefenseEffects(scheme, {
    coach,
    bias,
    threat,
  })

  return {
    scheme,
    label: effects.label,
    score: result.choice?.score ?? 0,
    effects,
    threat,
    bias,
    options: result.options,
  }
}

/**
 * Adapta cobertura após o set ofensivo ser conhecido (PnR → drop/hedge/switch/ice).
 */
export function adaptDefenseToSet(plan, offensiveSet, ctx = {}, rng = Math.random) {
  if (!plan || !offensiveSet?.id) return plan
  const setId = offensiveSet.id
  const pnrSets = ['pick_and_roll']
  const preferred = SCHEME_VS_OFFENSE[setId]
  if (!preferred?.length) return plan

  // Já é cobertura adequada
  if (preferred.includes(plan.scheme)) {
    return {
      ...plan,
      effects: buildDefenseEffects(plan.scheme, {
        coach: ctx.coach,
        bias: plan.bias,
        threat: { ...plan.threat, likelySet: setId, setId },
      }),
      adapted: false,
    }
  }

  // Em PnR, forçar cobertura de bloqueio se o coach gosta
  if (pnrSets.includes(setId)) {
    const bias = plan.bias ?? DEFAULT_BIAS_SAFE()
    const candidates = preferred.map((scheme) => ({
      id: scheme,
      score: (bias[scheme] ?? 50) + (scheme === 'drop_coverage' ? 5 : 0),
    }))
    const pick = decide(DECISION_IDS.defense_adapt, candidates, ctx, rng).choice
    if (pick?.id && (bias[pick.id] ?? 50) >= 48) {
      return {
        ...plan,
        scheme: pick.id,
        previousScheme: plan.scheme,
        adapted: true,
        effects: buildDefenseEffects(pick.id, {
          coach: ctx.coach,
          bias,
          threat: { ...plan.threat, likelySet: setId, setId },
        }),
        threat: { ...plan.threat, likelySet: setId, setId },
      }
    }
  }

  return {
    ...plan,
    effects: buildDefenseEffects(plan.scheme, {
      coach: ctx.coach,
      bias: plan.bias,
      threat: { ...plan.threat, likelySet: setId, setId },
    }),
    adapted: false,
  }
}

function clampBias(bias) {
  return Object.fromEntries(
    DEFENSE_SCHEMES.map((k) => [k, Number(bias?.[k] ?? 50)]),
  )
}

function DEFAULT_BIAS_SAFE() {
  return Object.fromEntries(DEFENSE_SCHEMES.map((k) => [k, 50]))
}
