/**
 * Constantes da Free Agency Engine.
 */

export const FREE_AGENCY_VERSION = 1

/** Franquias no painel de interesse */
export const FA_INTEREST_TOP = 8

/** Rumores no ticker */
export const FA_RUMOR_WINDOW = 10

export const FA_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

/** Filtros padrão da board */
export const FA_DEFAULT_FILTERS = {
  position: 'ALL',
  ageMin: 18,
  ageMax: 42,
  ovrMin: 60,
  ovrMax: 99,
  salaryMin: 0,
  salaryMax: 60_000_000,
  query: '',
}

/** Níveis de interesse (score normalizado) */
export const FA_INTEREST_LABELS = {
  hot: 'Alto',
  warm: 'Médio',
  cold: 'Baixo',
  none: 'Nenhum',
}
