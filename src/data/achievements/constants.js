/**
 * Achievement Engine — categorias e status.
 */

export const ACHIEVEMENT_CATEGORIES = {
  carreira: { id: 'carreira', label: 'Carreira' },
  temporada: { id: 'temporada', label: 'Temporada' },
  partida: { id: 'partida', label: 'Partida' },
  financeiro: { id: 'financeiro', label: 'Financeiro' },
  relacionamentos: { id: 'relacionamentos', label: 'Relacionamentos' },
  titulos: { id: 'titulos', label: 'Títulos' },
  estatisticas: { id: 'estatisticas', label: 'Estatísticas' },
  colecionaveis: { id: 'colecionaveis', label: 'Colecionáveis' },
}

export const ACHIEVEMENT_CATEGORY_IDS = Object.keys(ACHIEVEMENT_CATEGORIES)

export const ACHIEVEMENT_STATUS = {
  locked: 'locked',
  in_progress: 'in_progress',
  unlocked: 'unlocked',
}

export const ACHIEVEMENT_STATUS_LABEL = {
  locked: 'Bloqueada',
  in_progress: 'Em progresso',
  unlocked: 'Desbloqueada',
}
