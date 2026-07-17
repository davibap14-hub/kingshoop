import { POSITIONS } from '../lib/draft'
import { useMatchEngine } from '../hooks/useMatchEngine'
import ChaosDiceModal from './ChaosDiceModal'
import PresidentShotModal from './PresidentShotModal'

export default function MatchSimulator({
  homeLineup,
  awayLineup,
  homePresident = null,
  activeCard = null,
  formation = 'Equilibrada',
  playstyle = 'Run & Gun',
  onMatchEnd,
  onScoreUpdate,
  onActiveChange,
  onPhaseChange,
  onRequestRematch,
}) {
  const engine = useMatchEngine({
    homeLineup,
    awayLineup,
    homePresident,
    activeCard,
    formation,
    playstyle,
    onMatchEnd,
    onScoreUpdate,
    onActiveChange,
    onPhaseChange,
  })

  const {
    quarter,
    minutes,
    seconds,
    homeScore,
    awayScore,
    isPlaying,
    phase,
    feed,
    activePositions,
    targetScore,
    showPresidentModal,
    presidentShotSuccess,
    showDiceModal,
    isDiceSpinning,
    feedEndRef,
    tipOffLocked,
    togglePlay,
    rodarDadoDoCaos,
    arremessarPresidente,
  } = engine

  return (
    <div className="kh-panel flex h-full flex-col justify-between p-4 text-slate-300 shadow-pf-md">
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Casa
          </p>
          <span className="font-display text-4xl font-extrabold tracking-tight text-court-orange">
            {homeScore}
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-panel px-4 py-1 text-center shadow-pf-sm">
          <span className="block font-display text-xs font-bold uppercase tracking-wider text-kings-green">
            {phase}
          </span>
          <span className="font-display text-2xl font-bold tracking-widest text-slate-100">
            {phase === 'Matchball'
              ? 'MATCHBALL'
              : `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {phase === 'Intervalo' ? 'HT' : `Q${quarter}`}
          </span>
          {targetScore != null && phase === 'Matchball' && (
            <span className="mt-0.5 block text-[10px] font-semibold text-court-orange">
              Alvo {targetScore}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Fora
          </p>
          <span className="font-display text-4xl font-extrabold tracking-tight text-kings-green">
            {awayScore}
          </span>
        </div>
      </div>

      {activeCard && (
        <div className="animate-card-glow mb-3 flex items-center justify-between rounded-xl border border-kings-green/25 bg-kings-green/10 px-3 py-1.5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-kings-green">
              {activeCard.title}
            </p>
            <p className="text-[10px] leading-tight text-slate-400">
              {activeCard.description}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-kings-green px-2 py-0.5 text-[9px] font-bold text-dark-bg">
            ATIVO
          </span>
        </div>
      )}

      <div className="my-2 flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-panel p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Jogadores em Quadra
        </p>
        <div className="flex w-full justify-around gap-1">
          {POSITIONS.map((pos) => {
            const isActive = activePositions.includes(pos)
            return (
              <div
                key={pos}
                className={`flex-1 rounded-xl border py-2 text-center transition-all duration-300 ${
                  isActive
                    ? 'border-kings-green/30 bg-card-dark text-kings-green shadow-pf-sm'
                    : 'border-white/5 bg-dark-bg text-slate-500 line-through opacity-50'
                }`}
              >
                <span className="block font-display text-xs font-black">{pos}</span>
                <span className="block text-[9px] font-semibold">
                  {isActive ? homeLineup?.[pos]?.shortName || 'Vazio' : 'Banco'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="my-2 flex max-h-[160px] flex-1 flex-col gap-1.5 overflow-y-auto rounded-xl border border-white/10 bg-card-dark p-3 font-mono text-xs">
        {feed.map((entry, idx) => (
          <div
            key={`${idx}-${entry.slice(0, 12)}`}
            className={`animate-feed-in border-l-2 py-0.5 pl-2 ${
              entry.includes('[CASA]')
                ? 'border-court-orange text-court-orange'
                : entry.includes('[FORA]')
                  ? 'border-slate-500 text-slate-400'
                  : entry.includes('DADO') || entry.includes('MATCHBALL')
                    ? 'border-kings-green bg-kings-green/10 font-bold text-kings-green'
                    : 'border-white/10 text-slate-400'
            }`}
          >
            {entry}
          </div>
        ))}
        <div ref={feedEndRef} />
      </div>

      <div className="mt-3 flex gap-2">
        {phase === 'Fim' ? (
          <button
            type="button"
            onClick={() => onRequestRematch?.()}
            className="kh-btn-primary w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-widest"
          >
            Nova Partida / Ajustar Táticas
          </button>
        ) : (
          <button
            type="button"
            disabled={tipOffLocked}
            onClick={togglePlay}
            className={`w-full rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 ${
              isPlaying
                ? 'border-kings-red/30 bg-kings-red/10 text-kings-red hover:bg-kings-red/15'
                : 'kh-btn-primary border-transparent font-black'
            }`}
          >
            {isPlaying ? 'Pausar Partida' : 'Dar o Tip-Off'}
          </button>
        )}
      </div>

      {showPresidentModal && (
        <PresidentShotModal
          homePresident={homePresident}
          presidentShotSuccess={presidentShotSuccess}
          onShoot={arremessarPresidente}
        />
      )}

      {showDiceModal && (
        <ChaosDiceModal
          isDiceSpinning={isDiceSpinning}
          onRoll={rodarDadoDoCaos}
        />
      )}
    </div>
  )
}

export { POSITIONS }
