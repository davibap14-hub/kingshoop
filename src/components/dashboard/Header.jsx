import { CountUp, Pulse } from '../motion'
import { Avatar, Badge, Button, Icon } from '../ui'

/**
 * Header glass sticky — contexto da carreira.
 */
export default function Header({
  title,
  subtitle,
  playerName,
  teamShort,
  overall,
  week,
  season,
  onMenuClick,
  actions,
  notify = false,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 shadow-soft backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Abrir menu"
            >
              <Icon name="menu" size={18} />
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl font-extrabold uppercase tracking-tight text-navy sm:text-3xl">
                {title}
              </h1>
              {week != null && (
                <Badge tone="blue">
                  T{season} · Sem {week}
                </Badge>
              )}
              {notify ? (
                <Pulse active color="#ef4444">
                  <Badge tone="danger">Ação pendente</Badge>
                </Pulse>
              ) : null}
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-[var(--ds-muted)] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-2xl border border-[var(--ds-line)] bg-white/60 px-3 py-2 text-right shadow-soft backdrop-blur-sm">
              <p className="text-sm font-semibold text-ink">{playerName}</p>
              <p className="text-[11px] font-medium text-[var(--ds-muted)]">
                {teamShort} · OVR{' '}
                <CountUp
                  value={overall ?? 0}
                  className="font-display text-sm font-bold text-[var(--ds-accent)]"
                />
              </p>
            </div>
            <Avatar name={playerName} size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
