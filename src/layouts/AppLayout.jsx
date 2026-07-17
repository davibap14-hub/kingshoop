import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Header, Sidebar } from '../components/dashboard'
import { useCareerSnapshot } from '../hooks/useCareer'

const PAGE_META = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Visão geral da carreira · estilo NBA',
  },
  '/match': {
    title: 'Partida',
    subtitle: 'Simulação e box score',
  },
}

/**
 * Shell: Sidebar + Header + área principal.
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

  return (
    <div className="flex min-h-screen bg-ice text-slate-800">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-60 shadow-xl">
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

        <main className="dashboard-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  )
}
