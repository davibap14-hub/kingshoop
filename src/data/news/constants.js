/**
 * Constantes do News Engine.
 */

export const NEWS_CATEGORIES = {
  triple_double: {
    id: 'triple_double',
    label: 'Triple-Double',
    tone: 'positive',
  },
  record: { id: 'record', label: 'Recorde', tone: 'positive' },
  injury: { id: 'injury', label: 'Lesão', tone: 'negative' },
  trade: { id: 'trade', label: 'Troca', tone: 'neutral' },
  mvp: { id: 'mvp', label: 'MVP', tone: 'positive' },
  criticism: { id: 'criticism', label: 'Críticas', tone: 'negative' },
  rumor: { id: 'rumor', label: 'Rumores', tone: 'neutral' },
  retirement: { id: 'retirement', label: 'Aposentadoria', tone: 'neutral' },
  signing: { id: 'signing', label: 'Contratação', tone: 'positive' },
  draft: { id: 'draft', label: 'Draft', tone: 'positive' },
  award: { id: 'award', label: 'Prêmio', tone: 'positive' },
  blowout: { id: 'blowout', label: 'Passeio', tone: 'neutral' },
  franchise: { id: 'franchise', label: 'Franquia', tone: 'neutral' },
}

export const NEWS_CATEGORY_IDS = Object.keys(NEWS_CATEGORIES)

/** Máximo de notícias geradas por semana */
export const MAX_WEEKLY_NEWS = 10

/** Arquivo rolante de manchetes */
export const MAX_NEWS_FEED = 60
