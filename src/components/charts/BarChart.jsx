/**
 * Gráfico de barras SVG reutilizável.
 * @param {{ label: string, value: number }[]} data
 */
export default function BarChart({
  data = [],
  max = 100,
  height = 160,
  barClassName = 'fill-accent',
  className = '',
}) {
  const pad = { top: 12, right: 8, bottom: 28, left: 8 }
  const width = Math.max(240, data.length * 56)
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const gap = 10
  const barW = data.length
    ? (innerW - gap * (data.length - 1)) / data.length
    : 0

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      role="img"
      aria-label="Gráfico de barras"
    >
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + innerH * (1 - t)
        return (
          <line
            key={t}
            x1={pad.left}
            x2={width - pad.right}
            y1={y}
            y2={y}
            className="stroke-slate-100"
            strokeWidth="1"
          />
        )
      })}
      {data.map((item, i) => {
        const h = Math.max(2, (Math.min(item.value, max) / max) * innerH)
        const x = pad.left + i * (barW + gap)
        const y = pad.top + innerH - h
        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="4"
              className={`${barClassName} origin-bottom animate-fade-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-semibold uppercase"
            >
              {item.label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-navy text-[11px] font-bold"
            >
              {item.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
