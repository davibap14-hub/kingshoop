/**
 * Balance Engine — todos os knobs de equilíbrio do jogo.
 * Ajuste estes valores para tunar evolução, atributos, contratos e idade.
 */

// —— Atributos / overall ——
export const ATTR_HARD_MIN = 1
export const ATTR_HARD_MAX = 99
export const OVERALL_SOFT_CAP = 94
export const OVERALL_HARD_CAP = 99
/** Quanto o overall pode passar do potencial antes de frear forte */
export const POTENTIAL_OVERALL_SLACK = 2

// —— Treino (anti-inflação) ——
export const TRAINING_GAIN_MIN = 0
export const TRAINING_GAIN_MAX = 2
/** A partir deste valor, ganhos de treino diminuem */
export const TRAINING_DIMINISH_START = 74
/** Multiplicador mínimo perto do teto */
export const TRAINING_DIMINISH_FLOOR = 0.2
/** Treino respeita teto do arquétipo (soft) */
export const TRAINING_RESPECT_ARCHETYPE_CAP = true

// —— XP (anti-evolução exagerada) ——
export const XP_MIN_GAIN = 3
export const XP_MAX_GAIN = 36
export const XP_OVERALL_DIMINISH_START = 82
export const XP_OVERALL_DIMINISH_FLOOR = 0.45
export const XP_LEVEL_DIMINISH_START = 28
export const XP_LEVEL_DIMINISH_FLOOR = 0.55

// —— Rookies ——
export const ROOKIE_MAX_AGE = 23
export const ROOKIE_TRAINING_MULT = 1.22
export const ROOKIE_XP_MULT = 1.1
/** Fração do gap até o potencial fechada por temporada (NPCs / offseason) */
export const ROOKIE_SEASON_GROWTH_RATE = 0.28
export const ROOKIE_SEASON_ATTR_GAIN_MAX = 3
export const ROOKIE_CONTRACT_SCALE = 0.58

// —— Veteranos / decadência ——
export const VETERAN_DECLINE_START_AGE = 31
export const VETERAN_DECLINE_ACCEL_AGE = 35
export const VETERAN_TRAINING_MULT = 0.72
export const VETERAN_XP_MULT = 0.85
/** Perda base por atributo na decadência anual (antes dos pesos) */
export const VETERAN_DECLINE_BASE = 1
export const VETERAN_DECLINE_ACCEL_EXTRA = 1
/** Pesos de decadência por grupo (físico cai mais) */
export const VETERAN_DECLINE_GROUP_WEIGHTS = {
  fisico: 1.35,
  arremesso: 0.85,
  defesa: 1.0,
  qi: 0.45,
}
export const VETERAN_DECLINE_ATTR_MAX = 4

// —— Contratos ——
export const CONTRACT_MIN_SALARY = 900_000
export const CONTRACT_MAX_SALARY = 42_000_000
export const CONTRACT_BASE_SALARY = 1_150_000
export const CONTRACT_OVERALL_BASELINE = 62
export const CONTRACT_PER_OVERALL = 175_000
export const CONTRACT_POTENTIAL_PER_POINT = 55_000
export const CONTRACT_AGE_PEAK = 27
export const CONTRACT_AGE_PENALTY_PER_YEAR = 0.035
export const CONTRACT_AGE_BONUS_PER_YEAR_UNDER_PEAK = 0.01
export const CONTRACT_INFLATION_PER_SEASON = 0.02
export const CONTRACT_RENEW_BASE_BUMP = 1.05
export const CONTRACT_RENEW_MAX_BUMP = 1.18
export const CONTRACT_DEMAND_MIN = 0.88
export const CONTRACT_DEMAND_MAX = 1.22
/** Usa o salary cap do GM; reexportado para um único lugar de leitura */
export { SALARY_CAP as BALANCE_SALARY_CAP } from '../gm/constants'

// —— Draft / geração ——
export const DRAFT_ATTR_MIN = 28
export const DRAFT_ATTR_MAX = 92
export const DRAFT_POTENTIAL_MAX = 96

// —— Evolução por pontos ——
/** Slack além do potencial (média de grupo) ao gastar pontos */
export const EVOLUTION_POTENTIAL_SLACK = 1
