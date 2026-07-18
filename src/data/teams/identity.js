/**
 * Identidade visual padrão das franquias fundadoras.
 */

export const FOUNDING_TEAM_IDENTITY = {
  gsw: {
    colors: { primary: '#1D428A', secondary: '#FFC72C', accent: '#26282A' },
    logo: 'warriors-mark',
    arena: { name: 'Bay Arena', city: 'San Francisco', capacity: 18_064 },
    uniforms: {
      home: { primary: '#1D428A', secondary: '#FFC72C', name: 'Home Bay' },
      away: { primary: '#FFFFFF', secondary: '#1D428A', name: 'Away White' },
      alternate: { primary: '#26282A', secondary: '#FFC72C', name: 'City Bridge' },
    },
  },
  bos: {
    colors: { primary: '#007A33', secondary: '#BA9653', accent: '#FFFFFF' },
    logo: 'celtics-mark',
    arena: { name: 'Garden Pavilion', city: 'Boston', capacity: 19_156 },
    uniforms: {
      home: { primary: '#007A33', secondary: '#FFFFFF', name: 'Home Green' },
      away: { primary: '#FFFFFF', secondary: '#007A33', name: 'Away White' },
      alternate: { primary: '#BA9653', secondary: '#007A33', name: 'City Shamrock' },
    },
  },
  lal: {
    colors: { primary: '#552583', secondary: '#FDB927', accent: '#000000' },
    logo: 'lakers-mark',
    arena: { name: 'Forum West', city: 'Los Angeles', capacity: 19_068 },
    uniforms: {
      home: { primary: '#552583', secondary: '#FDB927', name: 'Home Purple' },
      away: { primary: '#FFFFFF', secondary: '#552583', name: 'Away White' },
      alternate: { primary: '#000000', secondary: '#FDB927', name: 'City Lights' },
    },
  },
  mia: {
    colors: { primary: '#98002E', secondary: '#F9A01B', accent: '#000000' },
    logo: 'heat-mark',
    arena: { name: 'Coastal Center', city: 'Miami', capacity: 19_600 },
    uniforms: {
      home: { primary: '#98002E', secondary: '#000000', name: 'Home Heat' },
      away: { primary: '#FFFFFF', secondary: '#98002E', name: 'Away White' },
      alternate: { primary: '#000000', secondary: '#F9A01B', name: 'City Vice' },
    },
  },
  den: {
    colors: { primary: '#0E2240', secondary: '#FEC524', accent: '#1D428A' },
    logo: 'nuggets-mark',
    arena: { name: 'Altitude Arena', city: 'Denver', capacity: 19_520 },
    uniforms: {
      home: { primary: '#0E2240', secondary: '#FEC524', name: 'Home Peak' },
      away: { primary: '#FFFFFF', secondary: '#0E2240', name: 'Away White' },
      alternate: { primary: '#1D428A', secondary: '#FEC524', name: 'City Summit' },
    },
  },
  nyk: {
    colors: { primary: '#006BB6', secondary: '#F58426', accent: '#FFFFFF' },
    logo: 'knicks-mark',
    arena: { name: 'Metro Garden', city: 'New York', capacity: 19_812 },
    uniforms: {
      home: { primary: '#006BB6', secondary: '#F58426', name: 'Home Blue' },
      away: { primary: '#FFFFFF', secondary: '#006BB6', name: 'Away White' },
      alternate: { primary: '#F58426', secondary: '#006BB6', name: 'City Orange' },
    },
  },
}

export function withTeamIdentity(team, identity = {}) {
  return {
    ...team,
    colors: identity.colors ?? team.colors ?? null,
    logo: identity.logo ?? team.logo ?? null,
    arena: identity.arena ?? team.arena ?? null,
    uniforms: identity.uniforms ?? team.uniforms ?? null,
  }
}
