import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getScreenTheme } from '../design-system'
import { Header, Sidebar } from '../components/dashboard'
import { useCareerSnapshot } from '../hooks/useCareer'

const PAGE_META = {
  '/': {
    title: 'Jogo',
    subtitle: 'Hub da carreira · o que fazer agora',
  },
  '/match-center': {
    title: 'Match Center',
    subtitle: 'Pré-jogo · dados das Engines',
  },
  '/live-match': {
    title: 'Ao vivo',
    subtitle: 'Replay do Play-by-Play · sem re-simular',
  },
  '/draft-night': {
    title: 'Draft Night',
    subtitle: 'Transmissão · painel ao vivo por pick',
  },
  '/free-agency': {
    title: 'Free Agency',
    subtitle: 'Mercado · negociação via Contract Engine',
  },
  '/nba-tv': {
    title: 'NBA TV',
    subtitle: 'Portal · News · History · Analytics',
  },
  '/franchise': {
    title: 'Franquia',
    subtitle: 'Elenco · Cap · GM · Objetivos · Histórico',
  },
  '/player-profile': {
    title: 'MyPLAYER',
    subtitle: 'Perfil 2K · DNA · Badges · Timeline',
  },
  '/match': {
    title: 'Partida',
    subtitle: 'Simulation Engine · Play-by-Play',
  },
}

/**
 * Shell AAA: Sidebar glass + Header + canvas temático por rota.
 */
export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { playerName, team, overall, currentWeek, currentSeason } =
    useCareerSnapshot()

  const meta = PAGE_META[location.pathname] ?? {
    title: 'The Fenômeno',
    subtitle: 'NBA Career Mode',
  }

  const theme = useMemo(
    () => getScreenTheme(location.pathname),
    [location.pathname],
  )

  const themeStyle = {
    '--ds-accent': theme.accent,
    '--ds-accent-soft': theme.accentSoft,
    '--ds-hero-from': theme.heroFrom,
    '--ds-hero-via': theme.heroVia,
    '--ds-hero-to': theme.heroTo,
    '--ds-ambient': theme.ambient,
    '--accent': theme.accent,
  }

  return (
    <div
      className="flex min-h-screen text-[var(--ds-ink)] transition-colors duration-500"
      data-screen={theme.id}
      style={themeStyle}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: 'var(--ds-canvas)',
          backgroundImage: `${theme.ambient}, linear-gradient(180deg, #f5f7fb 0%, #eef2f7 50%, #f8fafc 100%)`,
        }}
      />

      <div className="sticky top-0 z-30 hidden h-screen shrink-0 lg:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-64 animate-slide-in shadow-lift-lg">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          playerName={playerName}
          teamShort={team?.short}
          overall={overall}
          week={currentWeek}
          season={currentSeason}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="dashboard-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div
            key={location.pathname}
            className="mx-auto max-w-7xl animate-rise ds-stagger"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
