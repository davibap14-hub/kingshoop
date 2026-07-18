import { Avatar, Badge, Card, CardHeader, ProgressBar } from '../ui'

/**
 * Status do jogador — componente reutilizável.
 */
export default function PlayerStatus({
  playerName,
  team,
  position,
  overall,
  status = {},
  injury = null,
  className = '',
}) {
  const meters = [
    { key: 'energia', label: 'Energia', value: status.energia ?? 0 },
    { key: 'motivacao', label: 'Motivação', value: status.motivacao ?? 0 },
    { key: 'felicidade', label: 'Felicidade', value: status.felicidade ?? 0 },
    { key: 'popularidade', label: 'Popularidade', value: status.popularidade ?? 0 },
  ]

  return (
    <Card id="status" className={`animate-fade-up ${className}`}>
      <CardHeader
        subtitle="Status do jogador"
        title={playerName}
        action={
          <Badge tone={injury ? 'danger' : 'success'}>
            {injury ? 'Lesionado' : 'Saudável'}
          </Badge>
        }
      />

      <div className="flex items-center gap-4">
        <Avatar name={playerName} size="xl" />
        <div>
          <p className="font-display text-3xl font-extrabold tabular-nums text-navy">
            {overall}
            <span className="ml-1 text-sm font-semibold text-slate-400">OVR</span>
          </p>
          <p className="text-sm text-slate-500">
            {team?.short ?? '—'} · {position ?? 'SG'}
            {injury ? ` · ${injury.label}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {meters.map((m) => (
          <div key={m.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{m.label}</span>
              <span className="tabular-nums text-slate-500">{m.value}</span>
            </div>
            <ProgressBar value={m.value} barClassName="bg-navy" />
          </div>
        ))}
      </div>
    </Card>
  )
}
