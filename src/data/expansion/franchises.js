/**
 * Catálogo de franquias de expansão (inativas até a onda).
 * Inclui identidade visual, uniformes e arenas.
 */

export const EXPANSION_FRANCHISES = [
  {
    id: 'sea',
    name: 'Seattle Cascade',
    short: 'SEA',
    city: 'Seattle',
    conference: 'West',
    colors: {
      primary: '#005C5C',
      secondary: '#C4A265',
      accent: '#0B1F1F',
    },
    logo: 'cascade-mark',
    arena: {
      name: 'Emerald Dome',
      city: 'Seattle',
      capacity: 18_400,
    },
    uniforms: {
      home: { primary: '#005C5C', secondary: '#FFFFFF', name: 'Home Cascade' },
      away: { primary: '#F4F7F7', secondary: '#005C5C', name: 'Away Mist' },
      alternate: {
        primary: '#0B1F1F',
        secondary: '#C4A265',
        name: 'City Night Market',
      },
    },
    defaultPersonality: 'jovem',
  },
  {
    id: 'orl',
    name: 'Orlando Pulse',
    short: 'ORL',
    city: 'Orlando',
    conference: 'East',
    colors: {
      primary: '#1B3A6B',
      secondary: '#F2A900',
      accent: '#0E1C33',
    },
    logo: 'pulse-mark',
    arena: {
      name: 'Sunline Arena',
      city: 'Orlando',
      capacity: 17_900,
    },
    uniforms: {
      home: { primary: '#1B3A6B', secondary: '#F2A900', name: 'Home Pulse' },
      away: { primary: '#FFFFFF', secondary: '#1B3A6B', name: 'Away Citrus' },
      alternate: {
        primary: '#F2A900',
        secondary: '#0E1C33',
        name: 'City Sunset',
      },
    },
    defaultPersonality: 'reconstrucao',
  },
]

export const EXPANSION_FRANCHISE_BY_ID = Object.fromEntries(
  EXPANSION_FRANCHISES.map((f) => [f.id, f]),
)
