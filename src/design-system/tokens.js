/**
 * Design System — tokens do The Fenômeno (Interface only).
 * Não importar em engine/.
 */

export const DS_BRAND = {
  name: 'The Fenômeno',
  short: 'TF',
}

/** Identidade visual por rota — ambient + accent (não roxo / não cream genérico) */
export const SCREEN_THEMES = {
  '/': {
    id: 'hub',
    label: 'Jogo',
    accent: '#1d6fea',
    accentSoft: 'rgba(29, 111, 234, 0.12)',
    ambient:
      'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(29,111,234,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(232,163,23,0.10), transparent 50%)',
    heroFrom: '#0b1f33',
    heroVia: '#143252',
    heroTo: '#1a4570',
  },
  '/player-profile': {
    id: 'myplayer',
    label: 'MyPLAYER',
    accent: '#e8a317',
    accentSoft: 'rgba(232, 163, 23, 0.14)',
    ambient:
      'radial-gradient(ellipse 70% 45% at 80% -5%, rgba(232,163,23,0.16), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 20%, rgba(15,40,70,0.08), transparent 55%)',
    heroFrom: '#0b1524',
    heroVia: '#1a2f4a',
    heroTo: '#243d5c',
  },
  '/franchise': {
    id: 'franchise',
    label: 'Franquia',
    accent: '#0ea5a4',
    accentSoft: 'rgba(14, 165, 164, 0.12)',
    ambient:
      'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(14,165,164,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 10%, rgba(12,35,64,0.06), transparent 50%)',
    heroFrom: '#0c1a2e',
    heroVia: '#13404a',
    heroTo: '#1a5560',
  },
  '/match-center': {
    id: 'match-center',
    label: 'Match Center',
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.12)',
    ambient:
      'radial-gradient(ellipse 75% 50% at 50% -15%, rgba(37,99,235,0.14), transparent 55%)',
    heroFrom: '#0c1a2e',
    heroVia: '#142f4f',
    heroTo: '#1a3d66',
  },
  '/live-match': {
    id: 'live',
    label: 'Ao vivo',
    accent: '#ef4444',
    accentSoft: 'rgba(239, 68, 68, 0.12)',
    ambient:
      'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.10), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(12,35,64,0.06), transparent 45%)',
    heroFrom: '#0b1524',
    heroVia: '#13263f',
    heroTo: '#1a3050',
  },
  '/draft-night': {
    id: 'draft',
    label: 'Draft Night',
    accent: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.14)',
    ambient:
      'radial-gradient(ellipse 70% 45% at 15% 0%, rgba(220,38,38,0.10), transparent 50%), radial-gradient(ellipse 50% 40% at 90% 0%, rgba(245,158,11,0.12), transparent 50%)',
    heroFrom: '#0b1524',
    heroVia: '#12263f',
    heroTo: '#1a3a5c',
  },
  '/free-agency': {
    id: 'fa',
    label: 'Free Agency',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.12)',
    ambient:
      'radial-gradient(ellipse 70% 45% at 100% 0%, rgba(56,189,248,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 0% 30%, rgba(12,35,64,0.06), transparent 50%)',
    heroFrom: '#0c1a2e',
    heroVia: '#163556',
    heroTo: '#1f4a6e',
  },
  '/nba-tv': {
    id: 'nba-tv',
    label: 'NBA TV',
    accent: '#dc2626',
    accentSoft: 'rgba(220, 38, 38, 0.12)',
    ambient:
      'radial-gradient(ellipse 65% 40% at 20% 0%, rgba(220,38,38,0.12), transparent 50%), radial-gradient(ellipse 50% 35% at 90% 10%, rgba(56,189,248,0.08), transparent 45%)',
    heroFrom: '#0a1220',
    heroVia: '#121f35',
    heroTo: '#1a3352',
  },
  '/match': {
    id: 'match',
    label: 'Partida',
    accent: '#22c55e',
    accentSoft: 'rgba(34, 197, 94, 0.12)',
    ambient:
      'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(34,197,94,0.10), transparent 55%)',
    heroFrom: '#0c1f18',
    heroVia: '#143528',
    heroTo: '#1a4534',
  },
}

export function getScreenTheme(pathname = '/') {
  return SCREEN_THEMES[pathname] ?? SCREEN_THEMES['/']
}
