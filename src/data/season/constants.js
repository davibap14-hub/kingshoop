/**
 * Constantes da Season Engine — calendário da liga (escala 6 times).
 */

/** Fase da temporada */
export const SEASON_PHASES = {
  regular: 'regular',
  play_in: 'play_in',
  playoffs: 'playoffs',
  finals: 'finals',
  awards: 'awards',
  offseason: 'offseason',
}

/** Semanas do calendário (alinhado a WEEKS_PER_SEASON = 52) */
export const SEASON_CALENDAR = {
  regularStart: 1,
  regularEnd: 36,
  playInWeek: 37,
  playoffsStart: 38,
  playoffsEnd: 40,
  finalsStart: 41,
  finalsEnd: 42,
  awardsWeek: 43,
  offseasonStart: 44,
  offseasonEnd: 52,
}

export const CONFERENCES = ['East', 'West']

/** Chance semanal de nova lesão na liga (por time) */
export const LEAGUE_INJURY_CHANCE = 0.07

/** Duração típica de lesão de liga (semanas) */
export const LEAGUE_INJURY_WEEKS = [1, 2, 3]

/** Labels de lesão para elenco da liga */
export const LEAGUE_INJURY_LABELS = [
  'Entorse no tornozelo',
  'Contusão no joelho',
  'Estiramento na coxa',
  'Dor lombar',
  'Ombro inflamado',
]

/** Premiações da temporada */
export const AWARD_IDS = [
  'mvp',
  'dpoy',
  'mip',
  'coy',
  'finals_mvp',
  'champion',
]

export const AWARD_LABELS = {
  mvp: 'MVP',
  dpoy: 'Jogador Defensivo do Ano',
  mip: 'Jogador que Mais Evoluiu',
  coy: 'Treinador do Ano',
  finals_mvp: 'MVP das Finais',
  champion: 'Campeão da NBA',
}
