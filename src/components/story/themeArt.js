/**
 * Arte ilustrativa por tema — CSS/gradients (Interface only).
 */

export const STORY_THEME_ART = {
  treinador: {
    from: '#0b1f33',
    via: '#1a3a5c',
    to: '#c4a35a',
    accent: '#e8c56a',
    motif: 'clipboard',
    caption: 'Escritório do técnico',
  },
  companheiros: {
    from: '#121826',
    via: '#1e3a5f',
    to: '#3b82f6',
    accent: '#93c5fd',
    motif: 'locker',
    caption: 'Vestiário',
  },
  popularidade: {
    from: '#1a1025',
    via: '#3b0764',
    to: '#f43f5e',
    accent: '#fb7185',
    motif: 'flash',
    caption: 'Flash da imprensa',
  },
  desempenho: {
    from: '#0c1220',
    via: '#14532d',
    to: '#eab308',
    accent: '#fde047',
    motif: 'court',
    caption: 'Sob as luzes da arena',
  },
  patrocinios: {
    from: '#111827',
    via: '#1e293b',
    to: '#d4a017',
    accent: '#fbbf24',
    motif: 'deal',
    caption: 'Mesa de negócios',
  },
  cidade: {
    from: '#0f172a',
    via: '#1e3a5f',
    to: '#38bdf8',
    accent: '#7dd3fc',
    motif: 'skyline',
    caption: 'Nas ruas da cidade',
  },
  liga: {
    from: '#0b1524',
    via: '#1e293b',
    to: '#6366f1',
    accent: '#a5b4fc',
    motif: 'trophy',
    caption: 'Palco da liga',
  },
  time: {
    from: '#0c1a2e',
    via: '#134e4a',
    to: '#2dd4bf',
    accent: '#5eead4',
    motif: 'jersey',
    caption: 'Identidade da franquia',
  },
  relacionamentos: {
    from: '#1c1018',
    via: '#4a1942',
    to: '#ec4899',
    accent: '#f9a8d4',
    motif: 'bond',
    caption: 'Relações da carreira',
  },
  personalidade: {
    from: '#111827',
    via: '#312e81',
    to: '#f59e0b',
    accent: '#fcd34d',
    motif: 'mirror',
    caption: 'Quem você é',
  },
}

export function getThemeArt(themeId) {
  return (
    STORY_THEME_ART[themeId] ?? {
      from: '#0b1f33',
      via: '#143252',
      to: '#1a4570',
      accent: '#93c5fd',
      motif: 'court',
      caption: 'MyCareer',
    }
  )
}
