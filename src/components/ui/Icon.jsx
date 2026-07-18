/**
 * Ícones SVG consistentes do Design System.
 * stroke-based, 24×24, sem emoji.
 */

const PATHS = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z',
  user: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z',
  franchise:
    'M4 20V8l8-4 8 4v12H4Zm4-2h3v-4H8v4Zm5 0h3v-6h-3v6Zm5 0h2V9.2L12 6.1 6 9.2V18h2v-5h8v5Z',
  court:
    'M3 5h18v14H3V5Zm9 0v14M3 12h18M7.5 9.5v5M16.5 9.5v5',
  live: 'M12 6a8 8 0 1 1 0 12 8 8 0 0 1 0-12Zm-1.5 3.5v5l4.5-2.5-4.5-2.5Z',
  draft: 'M6 4h12v3H6V4Zm2 5h8l-1 11H9L8 9Zm1.5 2 .7 8h3.6l.7-8H9.5Z',
  market:
    'M4 7h16l-1.5 11H5.5L4 7Zm2-3h12v3H6V4Zm3 8h6',
  tv: 'M4 7h16v11H4V7Zm4 13h8M9 3l3 4 3-4',
  match: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4v5l3.5 2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevron: 'm9 6 6 6-6 6',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
  chart: 'M4 19V5m0 14h16M8 15V9m4 6V7m4 8v-3',
  shield: 'M12 3 20 7v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4Z',
}

export default function Icon({
  name = 'spark',
  size = 18,
  className = '',
  strokeWidth = 1.75,
}) {
  const d = PATHS[name] ?? PATHS.spark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['shrink-0', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

export const NAV_ICONS = {
  '/': 'home',
  '/player-profile': 'user',
  '/franchise': 'franchise',
  '/match-center': 'court',
  '/live-match': 'live',
  '/draft-night': 'draft',
  '/free-agency': 'market',
  '/nba-tv': 'tv',
  '/match': 'match',
}
