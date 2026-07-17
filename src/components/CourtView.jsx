import { useGame } from '../hooks/useGame'

const COURT_SPOTS = [
  { pos: 'PG', cx: 150, cy: 120 },
  { pos: 'SG', cx: 110, cy: 65 },
  { pos: 'SF', cx: 110, cy: 175 },
  { pos: 'PF', cx: 65, cy: 80 },
  { pos: 'C', cx: 50, cy: 120 },
]

export default function CourtView() {
  const { homeLineup, activePositions } = useGame()

  return (
    <div className="kh-panel relative flex max-h-[50%] min-h-[200px] flex-1 items-center justify-center overflow-hidden p-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 72% 42%, rgba(46,196,182,0.1), transparent 65%), radial-gradient(ellipse 35% 30% at 18% 65%, rgba(224,122,95,0.08), transparent 55%)',
        }}
      />
      <svg viewBox="0 0 400 240" className="relative z-[1] h-full w-full">
        <defs>
          <linearGradient id="courtFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4895a" />
            <stop offset="100%" stopColor="#a85c38" />
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="10"
          width="380"
          height="220"
          fill="url(#courtFill)"
          stroke="#2ec4b6"
          strokeWidth="2"
          rx="8"
        />
        <line
          x1="200"
          y1="10"
          x2="200"
          y2="230"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <circle
          cx="200"
          cy="120"
          r="30"
          fill="none"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <path
          d="M 10 30 A 100 100 0 0 1 10 210"
          fill="none"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M 390 30 A 100 100 0 0 0 390 210"
          fill="none"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <rect
          x="10"
          y="85"
          width="60"
          height="70"
          fill="none"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <rect
          x="330"
          y="85"
          width="60"
          height="70"
          fill="none"
          stroke="#2ec4b6"
          strokeWidth="1.5"
          opacity="0.55"
        />

        {homeLineup &&
          COURT_SPOTS.map(({ pos, cx, cy }) => {
            const on = activePositions.includes(pos)
            return (
              <g
                key={pos}
                className={`transition-all duration-500 ${on ? 'opacity-100' : 'opacity-25'}`}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill={on ? '#2ec4b6' : '#475569'}
                  stroke="#f5b731"
                  strokeWidth={on ? 2 : 1}
                />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill="#0b1220"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="Barlow Condensed, sans-serif"
                >
                  {pos}
                </text>
              </g>
            )
          })}
      </svg>

      {!homeLineup && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-[18px] bg-dark-bg/75 backdrop-blur-sm">
          <p className="animate-pulse text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Revele o Elenco para Ver a Quadra
          </p>
        </div>
      )}
    </div>
  )
}
