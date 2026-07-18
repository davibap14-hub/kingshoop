import { NavLink } from 'react-router-dom'
import { DS_BRAND } from '../../design-system'
import { Icon, NAV_ICONS } from '../ui'

const NAV = [
  { to: '/', label: 'Jogo', end: true },
  { to: '/player-profile', label: 'MyPLAYER', end: false },
  { to: '/franchise', label: 'Franquia', end: false },
  { to: '/match-center', label: 'Match Center', end: false },
  { to: '/live-match', label: 'Ao vivo', end: false },
  { to: '/draft-night', label: 'Draft Night', end: false },
  { to: '/free-agency', label: 'Free Agency', end: false },
  { to: '/nba-tv', label: 'NBA TV', end: false },
  { to: '/match', label: 'Partida', end: false },
]

const HASH_NAV = [
  { to: '/#temporada', label: 'Temporada' },
  { to: '/#gm', label: 'GM' },
  { to: '/#saves', label: 'Saves' },
]

/**
 * Sidebar glass — navegação AAA.
 */
export default function Sidebar({
  brand = DS_BRAND.short,
  title = DS_BRAND.name,
  collapsed = false,
  onNavigate,
}) {
  return (
    <aside
      className={[
        'flex h-full flex-col border-r border-white/40 bg-white/70 shadow-glass backdrop-blur-2xl',
        collapsed ? 'w-[76px]' : 'w-64',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 border-b border-[var(--ds-line)] px-4 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy via-navy-soft to-[#1a4570] font-display text-sm font-black text-white shadow-soft">
          {brand}
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-slide-in">
            <p className="truncate font-display text-base font-bold uppercase tracking-[0.14em] text-navy">
              {title}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-muted)]">
              NBA Career
            </p>
          </div>
        )}
      </div>

      <nav className="dashboard-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 ease-sport',
                isActive
                  ? 'bg-[var(--ds-accent-soft)] text-[var(--ds-accent)] shadow-soft'
                  : 'text-slate-500 hover:bg-white/80 hover:text-navy',
              ].join(' ')
            }
          >
            <Icon
              name={NAV_ICONS[item.to] ?? 'spark'}
              size={18}
              className="opacity-80 transition group-hover:opacity-100"
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        <div className="my-2 border-t border-[var(--ds-line)]" />

        {HASH_NAV.map((item) => (
          <a
            key={item.label}
            href={item.to}
            onClick={() => onNavigate?.()}
            className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400 transition hover:bg-white/80 hover:text-navy"
          >
            {!collapsed ? item.label : item.label.slice(0, 1)}
          </a>
        ))}
      </nav>

      <div className="border-t border-[var(--ds-line)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-muted)]">
          Design System
        </p>
        {!collapsed && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Visual AAA · 2K · Apple Sports
          </p>
        )}
      </div>
    </aside>
  )
}
