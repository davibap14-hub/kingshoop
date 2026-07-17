/**
 * Constantes da Simulation Engine — posse a posse.
 */

export const SIM_QUARTERS = 4
export const SIM_POSSESSIONS_PER_QUARTER = 24

/** Ações ofensivas / defensivas modeladas */
export const PLAY_ACTIONS = {
  ball_handler: 'ball_handler',
  individual_defense: 'individual_defense',
  help_defense: 'help_defense',
  pick_and_roll: 'pick_and_roll',
  isolation: 'isolation',
  drive: 'drive',
  kick_out: 'kick_out',
  cut: 'cut',
  screen: 'screen',
  post_up: 'post_up',
  fast_break: 'fast_break',
  offensive_rebound: 'offensive_rebound',
}

export const PLAY_ACTION_LABELS = {
  ball_handler: 'Ball Handler',
  individual_defense: 'Defesa individual',
  help_defense: 'Ajuda defensiva',
  pick_and_roll: 'Pick and Roll',
  isolation: 'Isolation',
  drive: 'Drive',
  kick_out: 'Kick Out',
  cut: 'Corte',
  screen: 'Screen',
  post_up: 'Post Up',
  fast_break: 'Fast Break',
  offensive_rebound: 'Rebound ofensivo',
}

/** Pesos base para escolher o set ofensivo (combinados com attrs) */
export const ACTION_SET_BASE_WEIGHTS = {
  pick_and_roll: 1.15,
  isolation: 1.0,
  drive: 1.05,
  post_up: 0.85,
  cut: 0.9,
  fast_break: 0.0, // só quando contexto permite
}

/** Home court como fatores de score (não bônus flat único) */
export const HOME_FACTORS = {
  ballSecurity: 0.04,
  finish: 0.03,
  contest: 0.02,
}

/** Temperatura da escolha ponderada (maior = mais determinístico pelo score) */
export const WEIGHT_POWER = 2.35
