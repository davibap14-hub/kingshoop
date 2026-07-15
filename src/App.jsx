import { useState } from 'react'
import MatchSimulator from './components/MatchSimulator'
import { secretCards } from './data/cards'
import { players } from './data/players'
import { computeDisplayMetrics } from './lib/tactics'

export default function App() {
  const [homeLineup, setHomeLineup] = useState(null)
  const [awayLineup, setAwayLineup] = useState(null)
  const [homePresident, setHomePresident] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

  const [gameStarted, setGameStarted] = useState(false)
  const [matchEnded, setMatchEnded] = useState(false)
  const [matchKey, setMatchKey] = useState(0)
  const [activePositions, setActivePositions] = useState(['PG'])
  const [globalScores, setGlobalScores] = useState({ homeScore: 0, awayScore: 0 })
  const [gamePhase, setGamePhase] = useState('Vestiário')

  const [formation, setFormation] = useState('Equilibrada')
  const [playstyle, setPlaystyle] = useState('Run & Gun')

  const controlsLocked = gameStarted && !matchEnded

  const voltarAoVestiario = () => {
    setGameStarted(false)
    setMatchEnded(false)
    setGamePhase('Pronto para o jogo')
    setActivePositions(['PG'])
    setGlobalScores({ homeScore: 0, awayScore: 0 })
  }

  const realizarDraft = () => {
    const atletasDisponiveis = players.filter((p) => !p.isPresident)
    const presidentes = players.filter((p) => p.isPresident)

    const obterJogadorPorPosicao = (posicao, pool) => {
      const candidatos = pool.filter((p) => p.position === posicao)
      if (!candidatos.length) return null
      return candidatos[Math.floor(Math.random() * candidatos.length)]
    }

    const timeCasa = {
      PG: obterJogadorPorPosicao('PG', atletasDisponiveis),
      SG: obterJogadorPorPosicao('SG', atletasDisponiveis),
      SF: obterJogadorPorPosicao('SF', atletasDisponiveis),
      PF: obterJogadorPorPosicao('PF', atletasDisponiveis),
      C: obterJogadorPorPosicao('C', atletasDisponiveis),
    }

    const idsCasa = new Set(
      Object.values(timeCasa).filter(Boolean).map((p) => p.id),
    )

    const timeFora = {
      PG: obterJogadorPorPosicao(
        'PG',
        atletasDisponiveis.filter((p) => !idsCasa.has(p.id)),
      ),
      SG: obterJogadorPorPosicao(
        'SG',
        atletasDisponiveis.filter((p) => !idsCasa.has(p.id)),
      ),
      SF: obterJogadorPorPosicao(
        'SF',
        atletasDisponiveis.filter((p) => !idsCasa.has(p.id)),
      ),
      PF: obterJogadorPorPosicao(
        'PF',
        atletasDisponiveis.filter((p) => !idsCasa.has(p.id)),
      ),
      C: obterJogadorPorPosicao(
        'C',
        atletasDisponiveis.filter((p) => !idsCasa.has(p.id)),
      ),
    }

    const presidente =
      presidentes[Math.floor(Math.random() * presidentes.length)] ?? null

    const cartaAleatoria =
      secretCards[Math.floor(Math.random() * secretCards.length)] ?? null

    setHomeLineup(timeCasa)
    setAwayLineup(timeFora)
    setHomePresident(presidente)
    setSelectedCard(cartaAleatoria)
    setGlobalScores({ homeScore: 0, awayScore: 0 })
    setGameStarted(false)
    setMatchEnded(false)
    setGamePhase('Pronto para o jogo')
    setActivePositions(['PG'])
  }

  const metricasCasa = computeDisplayMetrics(homeLineup, formation, playstyle)

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-dark-bg font-body text-slate-300">
      <header className="kh-header relative z-10 flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-kings-green to-kings-gold font-display text-xl font-black text-dark-bg shadow-pf-sm ring-1 ring-kings-gold/30">
            KH
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-[0.12em]">
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
          <span className="rounded-full bg-kings-green/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-kings-green">
            PRO MODE
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="flex w-1/4 min-w-0 flex-col justify-between border-r border-white/10 bg-card-dark/80 p-5 backdrop-blur-sm">
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
                    <option value="Equilibrada">Equilibrada (Padrão)</option>
                    <option value="Pace & Space">Pace & Space (Foco em 3PT)</option>
                    <option value="Post Up">Post Up (Foco no Garrafão)</option>
                    <option value="Full Court Press">Full Court Press (Defensiva)</option>
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
                    <option value="Run & Gun">Run & Gun (Transição Rápida)</option>
                    <option value="Meia Quadra">Meia Quadra (Posicional)</option>
                    <option value="Defesa First">Defesa Total (Grit)</option>
                    <option value="Iso Star">Isolação no Craque</option>
                  </select>
                </div>
              </div>
            </div>

            {homeLineup && (
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
            {homeLineup && !gameStarted && (
              <button
                type="button"
                onClick={() => {
                  setMatchKey((k) => k + 1)
                  setGameStarted(true)
                  setMatchEnded(false)
                  setGamePhase('Partida Ativa')
                  setGlobalScores({ homeScore: 0, awayScore: 0 })
                  setActivePositions(['PG'])
                }}
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

        <section className="flex h-full w-1/2 min-w-0 flex-col justify-between p-5">
          <div className="kh-panel relative flex max-h-[50%] min-h-[220px] flex-1 items-center justify-center overflow-hidden p-4">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  'radial-gradient(ellipse 55% 45% at 72% 42%, rgba(46,196,182,0.1), transparent 65%), radial-gradient(ellipse 35% 30% at 18% 65%, rgba(224,122,95,0.08), transparent 55%)',
              }}
            />
            <svg viewBox="0 0 400 240" className="relative z-[1] h-full w-full">
              <rect
                x="10"
                y="10"
                width="380"
                height="220"
                fill="url(#courtFill)"
                stroke="#2ec4b6"
                strokeWidth="2"
                rx="8"
              />
              <defs>
                <linearGradient id="courtFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4895a" />
                  <stop offset="100%" stopColor="#a85c38" />
                </linearGradient>
              </defs>
              <line x1="200" y1="10" x2="200" y2="230" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.55" />
              <circle cx="200" cy="120" r="30" fill="none" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.55" />
              <path d="M 10 30 A 100 100 0 0 1 10 210" fill="none" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.5" />
              <path d="M 390 30 A 100 100 0 0 0 390 210" fill="none" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.5" />
              <rect x="10" y="85" width="60" height="70" fill="none" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.55" />
              <rect x="330" y="85" width="60" height="70" fill="none" stroke="#2ec4b6" strokeWidth="1.5" opacity="0.55" />

              {homeLineup && (
                <>
                  {[
                    { pos: 'PG', cx: 150, cy: 120 },
                    { pos: 'SG', cx: 110, cy: 65 },
                    { pos: 'SF', cx: 110, cy: 175 },
                    { pos: 'PF', cx: 65, cy: 80 },
                    { pos: 'C', cx: 50, cy: 120 },
                  ].map(({ pos, cx, cy }) => {
                    const on = activePositions.includes(pos)
                    return (
                      <g
                        key={pos}
                        className={`transition-all duration-500 ${on ? 'opacity-100' : 'opacity-25'}`}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r="12"
                          fill={on ? '#2ec4b6' : '#475569'}
                          stroke="#f5b731"
                          strokeWidth={on ? 2 : 1}
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fill="#0b1220"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="Barlow Condensed, sans-serif"
                        >
                          {pos}
                        </text>
                      </g>
                    )
                  })}
                </>
              )}
            </svg>
            {!homeLineup && (
              <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-[18px] bg-dark-bg/75 backdrop-blur-sm">
                <p className="animate-pulse text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Revele o Elenco para Ver a Quadra
                </p>
              </div>
            )}
          </div>

          <div className="min-h-[50%] flex-1 pt-4">
            {gameStarted ? (
              <MatchSimulator
                key={matchKey}
                homeLineup={homeLineup}
                awayLineup={awayLineup}
                homePresident={homePresident}
                activeCard={selectedCard}
                formation={formation}
                playstyle={playstyle}
                onScoreUpdate={(scores) =>
                  setGlobalScores({
                    homeScore: scores.homeScore ?? scores.home ?? 0,
                    awayScore: scores.awayScore ?? scores.away ?? 0,
                  })
                }
                onActiveChange={(positions) => setActivePositions(positions)}
                onPhaseChange={(fase) => setGamePhase(fase)}
                onMatchEnd={() => {
                  setMatchEnded(true)
                  setGamePhase('Finalizado')
                }}
                onRequestRematch={voltarAoVestiario}
              />
            ) : (
              <div className="kh-panel flex h-full flex-col items-center justify-center p-6 text-center">
                <h3 className="mb-1 font-display text-2xl font-bold tracking-wide text-kings-green">
                  Simulador de Partida
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-400">
                  Defina as táticas, escolha uma carta secreta e aperte Iniciar
                  Partida para o tip-off.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="flex w-1/4 min-w-0 flex-col justify-between overflow-y-auto border-l border-white/10 bg-card-dark/80 p-5 backdrop-blur-sm">
          {homeLineup ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                  Métricas do Seu Time
                </h2>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-panel p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                      Ataque
                    </span>
                    <span className="font-display text-2xl font-extrabold text-court-orange">
                      {metricasCasa.att}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-panel p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                      Defesa
                    </span>
                    <span className="font-display text-2xl font-extrabold text-kings-green">
                      {metricasCasa.def}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-panel p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                      Geral
                    </span>
                    <span className="font-display text-2xl font-extrabold text-kings-green">
                      {metricasCasa.ovr}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-panel p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-400">
                      Química
                    </span>
                    <span className="font-display text-2xl font-extrabold text-kings-gold">
                      {metricasCasa.chem}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                  Starting Five
                </h2>
                <div className="flex flex-col gap-2">
                  {Object.entries(homeLineup).map(([pos, player]) => {
                    const onCourt = activePositions.includes(pos)
                    return (
                      <div
                        key={pos}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                          onCourt
                            ? 'border-white/10 bg-panel shadow-pf-sm opacity-100'
                            : 'border-white/5 bg-card-dark opacity-45'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-kings-green/15 font-display text-xs font-black text-kings-green">
                            {pos}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {player?.name ?? 'Vazio'}
                            </p>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                              {!onCourt && gameStarted
                                ? 'No banco'
                                : (player?.archetype ?? '')}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-lg border border-white/10 bg-pf-muted px-2 py-0.5 font-display text-sm font-bold text-slate-200">
                          {player?.overall ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {awayLineup && (
                <div className="border-t border-white/10 pt-4">
                  <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                    Elenco Rival
                  </h2>
                  <div className="grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-panel p-2 text-center shadow-pf-sm">
                    {Object.entries(awayLineup).map(([pos, player]) => (
                      <div key={pos}>
                        <span className="block text-[10px] font-bold text-slate-500">
                          {pos}
                        </span>
                        <span className="block font-display text-sm font-black leading-tight text-kings-green">
                          {player?.overall ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <p className="text-xs">Faça o draft para revelar as métricas do elenco.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
