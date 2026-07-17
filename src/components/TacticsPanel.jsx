import { secretCards } from '../data/cards'
import { useGame } from '../hooks/useGame'

const FORMATIONS = [
  { value: 'Equilibrada', label: 'Equilibrada (Padrão)' },
  { value: 'Pace & Space', label: 'Pace & Space (Foco em 3PT)' },
  { value: 'Post Up', label: 'Post Up (Foco no Garrafão)' },
  { value: 'Full Court Press', label: 'Full Court Press (Defensiva)' },
]

const PLAYSTYLES = [
  { value: 'Run & Gun', label: 'Run & Gun (Transição Rápida)' },
  { value: 'Meia Quadra', label: 'Meia Quadra (Posicional)' },
  { value: 'Defesa First', label: 'Defesa Total (Grit)' },
  { value: 'Iso Star', label: 'Isolação no Craque' },
]

export default function TacticsPanel() {
  const {
    formation,
    setFormation,
    playstyle,
    setPlaystyle,
    controlsLocked,
    hasLineup,
    selectedCard,
    setSelectedCard,
    homePresident,
    realizarDraft,
    gameStarted,
    matchEnded,
    iniciarPartida,
    voltarAoVestiario,
  } = useGame()

  return (
    <section className="flex w-full min-w-0 flex-col justify-between border-r border-white/10 bg-card-dark/80 p-4 backdrop-blur-sm sm:p-5 lg:w-1/4">
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Ajustes Táticos
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">
                Formação
              </label>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                disabled={controlsLocked}
                className="w-full rounded-xl border border-white/10 bg-panel p-2.5 text-sm font-semibold text-slate-200 shadow-pf-sm focus:border-kings-green focus:outline-none disabled:opacity-50"
              >
                {FORMATIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400">
                Estilo de Jogo
              </label>
              <select
                value={playstyle}
                onChange={(e) => setPlaystyle(e.target.value)}
                disabled={controlsLocked}
                className="w-full rounded-xl border border-white/10 bg-panel p-2.5 text-sm font-semibold text-slate-200 shadow-pf-sm focus:border-kings-green focus:outline-none disabled:opacity-50"
              >
                {PLAYSTYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {hasLineup && (
          <div className="border-t border-white/10 pt-4">
            <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
              Carta Secreta
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {secretCards.map((card) => {
                const isSelected = selectedCard?.id === card.id
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={controlsLocked}
                    onClick={() => setSelectedCard(card)}
                    className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 disabled:opacity-50 ${
                      isSelected
                        ? 'border-kings-green bg-kings-green/10 text-kings-green shadow-pf-navy'
                        : 'border-white/10 bg-panel text-slate-300 hover:border-kings-green/30'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight">
                      {card.title}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[9px] leading-snug text-slate-400">
                      {card.description}
                    </span>
                  </button>
                )
              })}
            </div>
            {homePresident && (
              <p className="mt-3 text-[10px] text-slate-400">
                Presidente:{' '}
                <span className="font-semibold text-kings-green">
                  {homePresident.shortName}
                </span>{' '}
                (arremesso no intervalo)
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={realizarDraft}
          disabled={controlsLocked}
          className="w-full rounded-xl border border-white/10 bg-panel py-3 text-xs font-bold uppercase tracking-wider text-slate-300 shadow-pf-sm transition-all hover:border-kings-green/30 disabled:opacity-50"
        >
          Revelar Elenco / Draft Auto
        </button>
        {hasLineup && !gameStarted && (
          <button
            type="button"
            onClick={iniciarPartida}
            className="kh-btn-primary w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest"
          >
            Iniciar Partida
          </button>
        )}
        {matchEnded && (
          <button
            type="button"
            onClick={voltarAoVestiario}
            className="w-full rounded-xl border border-kings-green/30 bg-kings-green/10 py-3 text-xs font-bold uppercase tracking-wider text-kings-green shadow-pf-sm transition-all hover:bg-kings-green/15"
          >
            Voltar ao Vestiário
          </button>
        )}
      </div>
    </section>
  )
}
