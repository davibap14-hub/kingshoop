/**
 * Radar chart SVG reutilizável (atributos do jogador).
 * @param {{ label: string, value: number }[]} data
 */
export default function RadarChart({
  data = [],
  max = 100,
  size = 220,
  className = '',
}) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const n = data.length || 1

  const angleAt = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2
  const point = (i, value) => {
    const a = angleAt(i)
    const r = (Math.min(value, max) / max) * radius
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const polygon = data
    .map((d, i) => point(i, d.value).join(','))
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`mx-auto w-full max-w-[240px] animate-fade-up ${className}`}
      role="img"
      aria-label="Radar de atributos"
    >
      {rings.map((t) => (
        <polygon
          key={t}
          points={Array.from({ length: n }, (_, i) =>
            point(i, max * t).join(','),
          ).join(' ')}
          className="fill-none stroke-slate-100"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, max)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            className="stroke-slate-100"
            strokeWidth="1"
          />
        )
      })}
      <polygon
        points={polygon}
        className="fill-accent/15 stroke-accent"
        strokeWidth="2"
      />
      {data.map((d, i) => {
        const [x, y] = point(i, d.value)
        const [lx, ly] = point(i, max * 1.18)
        return (
          <g key={d.label}>
            <circle cx={x} cy={y} r="3" className="fill-accent" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-[9px] font-bold uppercase"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
