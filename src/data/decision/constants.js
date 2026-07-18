/**
 * Decision Engine — IDs de decisão e pesos situacionais.
 * Nunca RNG puro: cada escolha usa combineScore + weightedSelect.
 */

export const DECISION_IDS = {
  ball_handler: 'ball_handler',
  cutter: 'cutter',
  receiver: 'receiver',
  driver: 'driver',
  screener: 'screener',
  pick_and_roll: 'pick_and_roll',
  shooter: 'shooter',
  isolation: 'isolation',
  stealer: 'stealer',
  contest: 'contest',
  rebounder: 'rebounder',
  passer: 'passer',
  primary_defender: 'primary_defender',
  help_defender: 'help_defender',
  offensive_set: 'offensive_set',
  finish_style: 'finish_style',
  on_ball_pressure: 'on_ball_pressure',
  steal_duel: 'steal_duel',
  shot_resolve: 'shot_resolve',
  rebound_duel: 'rebound_duel',
}

/** Pesos dos fatores situacionais (aplicados em todas as decisões) */
export const SITUATION_FACTOR_WEIGHTS = {
  attributes: 1.0,
  tendencies: 1.05,
  personality: 0.55,
  chemistry: 0.7,
  coach: 0.55,
  fatigue: 0.65,
  momentum: 0.45,
  matchup: 0.75,
  score: 0.5,
  clock: 0.55,
  pressure: 0.6,
  importance: 0.4,
}

/** Momentos de alta pressão */
export const PRESSURE_MOMENTS = {
  q4_close: { pressure: 85, importance: 90 },
  q4: { pressure: 65, importance: 70 },
  playoff: { pressure: 80, importance: 95 },
  blowout: { pressure: 25, importance: 30 },
  normal: { pressure: 45, importance: 50 },
}
