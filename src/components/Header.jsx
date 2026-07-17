import { useGame } from '../hooks/useGame'

export default function Header() {
  const { gameStarted, gamePhase, globalScores } = useGame()

  return (
    <header className="kh-header relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-kings-green to-kings-gold font-display text-lg font-black text-dark-bg shadow-pf-sm ring-1 ring-kings-gold/30 sm:h-11 sm:w-11 sm:text-xl">
          KH
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-[0.12em] sm:text-3xl">
          <span className="text-kings-green">KINGS</span>
          <span className="text-court-orange">HOOP</span>
        </h1>
      </div>

      {gameStarted && (
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:inline">
            {gamePhase}
          </span>
          <div className="flex gap-4 rounded-full border border-white/10 bg-card-dark px-4 py-1 font-display text-xl shadow-pf-sm">
            <span className="font-extrabold text-court-orange">
              {globalScores.homeScore}
            </span>
            <span className="text-slate-600">:</span>
            <span className="font-extrabold text-kings-green">
              {globalScores.awayScore}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-kings-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-kings-green sm:text-xs">
          Live Sim
        </span>
      </div>
    </header>
  )
}
