import { useState } from 'react'
import MatchSimulator from './components/MatchSimulator'
import { secretCards } from './data/cards'
import { players } from './data/players'

export default function App() {
  const [homeLineup, setHomeLineup] = useState(null)
  const [awayLineup, setAwayLineup] = useState(null)
  const [homePresident, setHomePresident] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

  const [gameStarted, setGameStarted] = useState(false)
  const [matchKey, setMatchKey] = useState(0)
  const [activePositions, setActivePositions] = useState(['PG'])
  const [globalScores, setGlobalScores] = useState({ homeScore: 0, awayScore: 0 })
  const [gamePhase, setGamePhase] = useState('Vestiário')

  const [formation, setFormation] = useState('Equilibrada')
  const [playstyle, setPlaystyle] = useState('Run & Gun')

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

    const timeFora = {
      PG: obterJogadorPorPosicao(
        'PG',
        atletasDisponiveis.filter((p) => p.id !== timeCasa.PG?.id),
      ),
      SG: obterJogadorPorPosicao(
        'SG',
        atletasDisponiveis.filter((p) => p.id !== timeCasa.SG?.id),
      ),
      SF: obterJogadorPorPosicao(
        'SF',
        atletasDisponiveis.filter((p) => p.id !== timeCasa.SF?.id),
      ),
      PF: obterJogadorPorPosicao(
        'PF',
        atletasDisponiveis.filter((p) => p.id !== timeCasa.PF?.id),
      ),
      C: obterJogadorPorPosicao(
        'C',
        atletasDisponiveis.filter((p) => p.id !== timeCasa.C?.id),
      ),
    }

    const presidente =
      presidentes[Math.floor(Math.random() * presidentes.length)] ?? null

    setHomeLineup(timeCasa)
    setAwayLineup(timeFora)
    setHomePresident(presidente)
    setSelectedCard(secretCards[0] ?? null)
    setGlobalScores({ homeScore: 0, awayScore: 0 })
    setGameStarted(false)
    setGamePhase('Pronto para o jogo')
    setActivePositions(['PG'])
  }

  const calcularMetricasTime = (lineup) => {
    if (!lineup) return { att: 0, def: 0, ovr: 0, chem: 0 }
    const ativos = Object.values(lineup).filter(Boolean)
    if (!ativos.length) return { att: 0, def: 0, ovr: 0, chem: 0 }
    const att = Math.round(ativos.reduce((acc, p) => acc + p.attack, 0) / ativos.length)
    const def = Math.round(ativos.reduce((acc, p) => acc + p.defense, 0) / ativos.length)
    const ovr = Math.round(ativos.reduce((acc, p) => acc + p.overall, 0) / ativos.length)
    const chem = 85
    return { att, def, ovr, chem }
  }

  const metricasCasa = calcularMetricasTime(homeLineup)

  return (
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden bg-dark-bg font-[family-name:var(--font-body)] text-white">
      {/* Header */}
      <header className="z-10 flex items-center justify-between border-b border-slate-800 bg-card-dark/80 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-court-orange font-display text-xl leading-none text-dark-bg">
            KH
          </div>
          <h1 className="font-display text-3xl tracking-widest text-court-orange">
            KINGS<span className="text-kings-green">HOOP</span>
          </h1>
        </div>

        {gameStarted && (
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] uppercase tracking-widest text-slate-500 sm:inline">
              {gamePhase}
            </span>
            <div className="flex gap-4 rounded-full border border-slate-800 bg-slate-950 px-4 py-1 font-mono text-lg">
              <span className="font-black text-court-orange">
                {globalScores.homeScore}
              </span>
              <span className="text-slate-600">:</span>
              <span className="font-black text-slate-300">
                {globalScores.awayScore}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="rounded border border-kings-green/20 bg-kings-green/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-kings-green">
            PRO MODE
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        {/* Coluna esquerda — Painel Tático */}
        <section className="flex w-1/4 min-w-0 flex-col justify-between border-r border-slate-800/80 bg-card-dark/40 p-5">
          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Ajustes Táticos
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Formação</label>
                  <select
                    value={formation}
                    onChange={(e) => setFormation(e.target.value)}
                    disabled={gameStarted}
                    className="w-full rounded-lg border border-slate-700/60 bg-card-dark p-2 text-sm focus:border-kings-green focus:outline-none disabled:opacity-50"
                  >
                    <option value="Equilibrada">Equilibrada (Padrão)</option>
                    <option value="Pace & Space">Pace & Space (Foco em 3PT)</option>
                    <option value="Post Up">Post Up (Foco no Garrafão)</option>
                    <option value="Full Court Press">Full Court Press (Defensiva)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Estilo de Jogo
                  </label>
                  <select
                    value={playstyle}
                    onChange={(e) => setPlaystyle(e.target.value)}
                    disabled={gameStarted}
                    className="w-full rounded-lg border border-slate-700/60 bg-card-dark p-2 text-sm focus:border-kings-green focus:outline-none disabled:opacity-50"
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
              <div className="border-t border-slate-800/80 pt-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Carta Secreta
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {secretCards.map((card) => {
                    const isSelected = selectedCard?.id === card.id
                    return (
                      <button
                        key={card.id}
                        type="button"
                        disabled={gameStarted}
                        onClick={() => setSelectedCard(card)}
                        className={`flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all duration-200 disabled:opacity-50 ${
                          isSelected
                            ? 'border-kings-green bg-kings-green/10 text-kings-green shadow-[0_0_10px_rgba(46,196,182,0.15)]'
                            : 'border-slate-700/50 bg-card-dark text-slate-300 hover:border-slate-500'
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
                  <p className="mt-3 text-[10px] text-slate-500">
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

          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={realizarDraft}
              disabled={gameStarted}
              className="w-full rounded-xl border border-slate-700 bg-card-dark py-3 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all hover:border-slate-500 disabled:opacity-50"
            >
              Revelar Elenco / Draft Auto
            </button>
            {homeLineup && !gameStarted && (
              <button
                type="button"
                onClick={() => {
                  setMatchKey((k) => k + 1)
                  setGameStarted(true)
                  setGamePhase('Partida Ativa')
                  setGlobalScores({ homeScore: 0, awayScore: 0 })
                  setActivePositions(['PG'])
                }}
                className="w-full rounded-xl bg-kings-green py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.2)] transition-all hover:bg-opacity-95"
              >
                Iniciar Partida
              </button>
            )}
          </div>
        </section>

        {/* Coluna central — Quadra + Simulador */}
        <section className="flex h-full w-1/2 min-w-0 flex-col justify-between bg-dark-bg p-5">
          <div className="relative flex max-h-[50%] min-h-[220px] flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <svg viewBox="0 0 400 240" className="h-full w-full opacity-80">
              <rect
                x="10"
                y="10"
                width="380"
                height="220"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />
              <line
                x1="200"
                y1="10"
                x2="200"
                y2="230"
                stroke="#334155"
                strokeWidth="2"
              />
              <circle
                cx="200"
                cy="120"
                r="30"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />
              <path
                d="M 10 30 A 100 100 0 0 1 10 210"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />
              <path
                d="M 390 30 A 100 100 0 0 0 390 210"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />
              <rect
                x="10"
                y="85"
                width="60"
                height="70"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />
              <rect
                x="330"
                y="85"
                width="60"
                height="70"
                fill="none"
                stroke="#334155"
                strokeWidth="2"
              />

              {homeLineup && (
                <>
                  <g
                    className={`transition-all duration-500 ${
                      activePositions.includes('PG') ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <circle cx="150" cy="120" r="11" fill="#e07a5f" />
                    <text
                      x="150"
                      y="123"
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      PG
                    </text>
                  </g>
                  <g
                    className={`transition-all duration-500 ${
                      activePositions.includes('SG') ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <circle cx="110" cy="65" r="11" fill="#e07a5f" />
                    <text
                      x="110"
                      y="68"
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      SG
                    </text>
                  </g>
                  <g
                    className={`transition-all duration-500 ${
                      activePositions.includes('SF') ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <circle cx="110" cy="175" r="11" fill="#e07a5f" />
                    <text
                      x="110"
                      y="178"
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      SF
                    </text>
                  </g>
                  <g
                    className={`transition-all duration-500 ${
                      activePositions.includes('PF') ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <circle cx="65" cy="80" r="11" fill="#e07a5f" />
                    <text
                      x="65"
                      y="83"
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      PF
                    </text>
                  </g>
                  <g
                    className={`transition-all duration-500 ${
                      activePositions.includes('C') ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <circle cx="50" cy="120" r="11" fill="#e07a5f" />
                    <text
                      x="50"
                      y="123"
                      textAnchor="middle"
                      fill="black"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      C
                    </text>
                  </g>
                </>
              )}
            </svg>
            {!homeLineup && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/80">
                <p className="animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
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
                onScoreUpdate={(scores) =>
                  setGlobalScores({
                    homeScore: scores.homeScore ?? scores.home ?? 0,
                    awayScore: scores.awayScore ?? scores.away ?? 0,
                  })
                }
                onActiveChange={(positions) => setActivePositions(positions)}
                onPhaseChange={(fase) => setGamePhase(fase)}
                onMatchEnd={() => setGamePhase('Finalizado')}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-card-dark/20 p-6 text-center">
                <h3 className="mb-1 font-bold text-slate-300">Simulador de Partida</h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Defina as táticas, escolha uma carta secreta e aperte Iniciar
                  Partida para o tip-off.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Coluna direita — Lineups */}
        <section className="flex w-1/4 min-w-0 flex-col justify-between overflow-y-auto border-l border-slate-800/80 bg-card-dark/40 p-5">
          {homeLineup ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Métricas do Seu Time
                </h2>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg border border-slate-700/40 bg-card-dark/80 p-2">
                    <span className="block text-xs text-slate-400">ATAQUE</span>
                    <span className="text-lg font-extrabold text-court-orange">
                      {metricasCasa.att}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-card-dark/80 p-2">
                    <span className="block text-xs text-slate-400">DEFESA</span>
                    <span className="text-lg font-extrabold text-sky-400">
                      {metricasCasa.def}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-card-dark/80 p-2">
                    <span className="block text-xs text-slate-400">GERAL (OVR)</span>
                    <span className="text-lg font-extrabold text-kings-green">
                      {metricasCasa.ovr}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-700/40 bg-card-dark/80 p-2">
                    <span className="block text-xs text-slate-400">QUÍMICA</span>
                    <span className="text-lg font-extrabold text-yellow-400">
                      {metricasCasa.chem}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Starting Five
                </h2>
                <div className="flex flex-col gap-2">
                  {Object.entries(homeLineup).map(([pos, player]) => {
                    const onCourt = activePositions.includes(pos)
                    return (
                      <div
                        key={pos}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-opacity ${
                          onCourt
                            ? 'border-slate-700/40 bg-card-dark opacity-100'
                            : 'border-slate-800 bg-card-dark/50 opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950/60 font-mono text-xs font-black text-kings-green">
                            {pos}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {player?.name ?? 'Vazio'}
                            </p>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400">
                              {!onCourt && gameStarted
                                ? 'No banco'
                                : (player?.archetype ?? '')}
                            </span>
                          </div>
                        </div>
                        <span className="rounded border border-slate-700/50 bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
                          {player?.overall ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {awayLineup && (
                <div className="border-t border-slate-800/80 pt-4">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Elenco Rival
                  </h2>
                  <div className="grid grid-cols-5 gap-1 rounded-lg border border-slate-800/60 bg-slate-950/40 p-2 text-center">
                    {Object.entries(awayLineup).map(([pos, player]) => (
                      <div key={pos}>
                        <span className="block text-[10px] font-bold text-slate-500">
                          {pos}
                        </span>
                        <span className="block font-mono text-xs font-black leading-tight text-slate-300">
                          {player?.overall ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <p className="text-xs">Faça o draft para revelar as métricas do elenco.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
