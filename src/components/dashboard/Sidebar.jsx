import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Jogo', end: true },
  { to: '/franchise', label: 'Franquia', end: false },
  { to: '/match-center', label: 'Match Center', end: false },
  { to: '/live-match', label: 'Ao vivo', end: false },
  { to: '/draft-night', label: 'Draft Night', end: false },
  { to: '/free-agency', label: 'Free Agency', end: false },
  { to: '/nba-tv', label: 'NBA TV', end: false },
  { to: '/match', label: 'Partida', end: false },
  { to: '/#temporada', label: 'Temporada', end: false, hash: true },
  { to: '/#gm', label: 'GM', end: false, hash: true },
  { to: '/#saves', label: 'Saves', end: false, hash: true },
  { to: '/#calendario', label: 'Calendário', end: false, hash: true },
  { to: '/#status', label: 'Status', end: false, hash: true },
]

/**
 * Sidebar reutilizável do dashboard NBA.
 */
export default function Sidebar({
  brand = 'TF',
  title = 'The Fenômeno',
  collapsed = false,
  onNavigate,
}) {
  return (
    <aside
      className={[
        'flex h-full flex-col border-r border-slate-200/90 bg-white',
        collapsed ? 'w-[72px]' : 'w-60',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy font-display text-sm font-black text-white">
          {brand}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold uppercase tracking-[0.12em] text-navy">
              {title}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              NBA Career
            </p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          if (item.hash) {
            return (
              <a
                key={item.label}
                href={item.to}
                onClick={() => onNavigate?.()}
                className="rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 hover:text-navy"
              >
                {item.label}
              </a>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Temporada
        </p>
        {!collapsed && (
          <p className="mt-1 text-xs text-slate-500">
            Dashboard inspirado na NBA
          </p>
        )}
      </div>
    </aside>
  )
}
