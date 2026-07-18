import { Avatar, Badge, Button } from '../ui'

/**
 * Header reutilizável do dashboard.
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
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Abrir menu"
            >
              Menu
            </Button>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-xl font-extrabold text-navy sm:text-2xl">
                {title}
              </h1>
              {week != null && (
                <Badge tone="blue">
                  T{season} · Sem {week}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{playerName}</p>
              <p className="text-[11px] text-slate-500">
                {teamShort} · OVR {overall}
              </p>
            </div>
            <Avatar name={playerName} size="md" />
          </div>
        </div>
      </div>
    </header>
  )
}
