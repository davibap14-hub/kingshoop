/**
 * Gráfico de linha SVG reutilizável.
 * @param {{ label?: string, value: number }[]} data
 */
export default function LineChart({
  data = [],
  height = 140,
  strokeClassName = 'stroke-accent',
  fillClassName = 'fill-accent/10',
  className = '',
}) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-slate-400">
        Sem dados
      </div>
    )
  }

  const pad = { top: 16, right: 12, bottom: 24, left: 28 }
  const width = 360
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const points = data.map((d, i) => {
    const x = pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = pad.top + innerH - ((d.value - min) / span) * innerH
    return { x, y, ...d }
  })

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full animate-fade-up ${className}`}
      role="img"
      aria-label="Gráfico de linha"
    >
      <path d={area} className={fillClassName} />
      <path
        d={line}
        fill="none"
        className={strokeClassName}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          className="fill-white stroke-accent"
          strokeWidth="2"
        />
      ))}
      {points.map((p, i) =>
        p.label ? (
          <text
            key={`l-${i}`}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-semibold"
          >
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  )
}
