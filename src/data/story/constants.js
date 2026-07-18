/**
 * Story Engine — temas, flags e parâmetros de geração procedural.
 */

export const STORY_THEMES = {
  relacionamentos: { id: 'relacionamentos', label: 'Relacionamentos', weight: 1 },
  personalidade: { id: 'personalidade', label: 'Personalidade', weight: 0.8 },
  popularidade: { id: 'popularidade', label: 'Popularidade', weight: 1 },
  desempenho: { id: 'desempenho', label: 'Desempenho', weight: 1.1 },
  time: { id: 'time', label: 'Time', weight: 1 },
  cidade: { id: 'cidade', label: 'Cidade', weight: 0.9 },
  patrocinios: { id: 'patrocinios', label: 'Patrocínios', weight: 0.95 },
  treinador: { id: 'treinador', label: 'Treinador', weight: 1.05 },
  companheiros: { id: 'companheiros', label: 'Companheiros', weight: 1.1 },
  liga: { id: 'liga', label: 'Liga', weight: 1 },
}

export const STORY_THEME_IDS = Object.keys(STORY_THEMES)

/** Chance base de gerar história no fim da semana (antes de pesos) */
export const STORY_BASE_CHANCE = 0.55

/** Máximo de cadeias abertas simultâneas */
export const STORY_MAX_OPEN_CHAINS = 4

/** Histórico de decisões guardado */
export const STORY_HISTORY_LIMIT = 40

/** Cooldown mínimo (semanas) para repetir o mesmo tema em cadeia nova */
export const STORY_THEME_COOLDOWN = 2

/** Estágios típicos de uma cadeia narrativa */
export const STORY_CHAIN_STAGES = 3
