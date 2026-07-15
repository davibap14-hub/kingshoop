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
    <div className="flex h-screen w-screen select-none flex-col overflow-hidden font-body text-slate-800">
      <header className="kh-header relative z-10 flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-nba-navy to-nba-navy-hover font-display text-xl text-white shadow-pf-sm ring-1 ring-nba-navy/10">
            KH
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-[0.12em] text-nba-navy">
            KINGS<span className="text-nba-red">HOOP</span>
          </h1>
        </div>

        {gameStarted && (
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline">
              {gamePhase}
            </span>
            <div className="flex gap-4 rounded-full border border-slate-200/80 bg-white px-4 py-1 font-display text-xl shadow-pf-sm">
              <span className="font-extrabold text-nba-orange">
                {globalScores.homeScore}
              </span>
              <span className="text-slate-300">:</span>
              <span className="font-extrabold text-nba-navy">
                {globalScores.awayScore}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-nba-navy/8 px-3 py-1 text-xs font-bold uppercase tracking-wider text-nba-navy">
            PRO MODE
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="flex w-1/4 min-w-0 flex-col justify-between border-r border-slate-200/80 bg-white/55 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-5 overflow-y-auto pr-1">
            <div>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                Ajustes Táticos
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Formação
                  </label>
                  <select
                    value={formation}
                    onChange={(e) => setFormation(e.target.value)}
                    disabled={gameStarted}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 shadow-pf-sm focus:border-nba-navy focus:outline-none disabled:opacity-50"
                  >
                    <option value="Equilibrada">Equilibrada (Padrão)</option>
                    <option value="Pace & Space">Pace & Space (Foco em 3PT)</option>
                    <option value="Post Up">Post Up (Foco no Garrafão)</option>
                    <option value="Full Court Press">Full Court Press (Defensiva)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Estilo de Jogo
                  </label>
                  <select
                    value={playstyle}
                    onChange={(e) => setPlaystyle(e.target.value)}
                    disabled={gameStarted}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-700 shadow-pf-sm focus:border-nba-navy focus:outline-none disabled:opacity-50"
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
              <div className="border-t border-slate-200/80 pt-4">
                <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
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
                        className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all duration-200 disabled:opacity-50 ${
                          isSelected
                            ? 'border-nba-navy bg-nba-navy/8 text-nba-navy shadow-pf-navy'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-tight">
                          {card.title}
                        </span>
                        <span className="mt-1 line-clamp-2 text-[9px] leading-snug text-slate-500">
                          {card.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {homePresident && (
                  <p className="mt-3 text-[10px] text-slate-500">
                    Presidente:{' '}
                    <span className="font-semibold text-nba-navy">
                      {homePresident.shortName}
                    </span>{' '}
                    (arremesso no intervalo)
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4">
            <button
              type="button"
              onClick={realizarDraft}
              disabled={gameStarted}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-pf-sm transition-all hover:border-nba-navy/30 disabled:opacity-50"
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
                className="kh-btn-primary w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest"
              >
                Iniciar Partida
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
                  'radial-gradient(ellipse 55% 45% at 72% 42%, rgba(23,64,139,0.08), transparent 65%), radial-gradient(ellipse 35% 30% at 18% 65%, rgba(201,8,42,0.05), transparent 55%)',
              }}
            />
            <svg viewBox="0 0 400 240" className="relative z-[1] h-full w-full">
              <rect
                x="10"
                y="10"
                width="380"
                height="220"
                fill="url(#courtFill)"
                stroke="#17408b"
                strokeWidth="2"
                rx="8"
              />
              <defs>
                <linearGradient id="courtFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff8f0" />
                  <stop offset="100%" stopColor="#f0e0cc" />
                </linearGradient>
              </defs>
              <line x1="200" y1="10" x2="200" y2="230" stroke="#17408b" strokeWidth="1.5" opacity="0.45" />
              <circle cx="200" cy="120" r="30" fill="none" stroke="#17408b" strokeWidth="1.5" opacity="0.45" />
              <path d="M 10 30 A 100 100 0 0 1 10 210" fill="none" stroke="#17408b" strokeWidth="1.5" opacity="0.4" />
              <path d="M 390 30 A 100 100 0 0 0 390 210" fill="none" stroke="#17408b" strokeWidth="1.5" opacity="0.4" />
              <rect x="10" y="85" width="60" height="70" fill="none" stroke="#17408b" strokeWidth="1.5" opacity="0.45" />
              <rect x="330" y="85" width="60" height="70" fill="none" stroke="#17408b" strokeWidth="1.5" opacity="0.45" />

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
                          fill={on ? '#17408b' : '#94a3b8'}
                          stroke="#f5b731"
                          strokeWidth={on ? 2 : 1}
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fill="white"
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
              <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-[18px] bg-white/75 backdrop-blur-sm">
                <p className="animate-pulse text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
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
              <div className="kh-panel flex h-full flex-col items-center justify-center p-6 text-center">
                <h3 className="mb-1 font-display text-2xl font-bold tracking-wide text-nba-navy">
                  Simulador de Partida
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Defina as táticas, escolha uma carta secreta e aperte Iniciar
                  Partida para o tip-off.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="flex w-1/4 min-w-0 flex-col justify-between overflow-y-auto border-l border-slate-200/80 bg-white/55 p-5 backdrop-blur-sm">
          {homeLineup ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                  Métricas do Seu Time
                </h2>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-500">
                      Ataque
                    </span>
                    <span className="font-display text-2xl font-extrabold text-nba-orange">
                      {metricasCasa.att}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-500">
                      Defesa
                    </span>
                    <span className="font-display text-2xl font-extrabold text-nba-navy">
                      {metricasCasa.def}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-500">
                      Geral
                    </span>
                    <span className="font-display text-2xl font-extrabold text-nba-navy">
                      {metricasCasa.ovr}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-pf-sm">
                    <span className="block text-[10px] font-semibold uppercase text-slate-500">
                      Química
                    </span>
                    <span className="font-display text-2xl font-extrabold text-nba-gold">
                      {metricasCasa.chem}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
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
                            ? 'border-slate-200 bg-white shadow-pf-sm opacity-100'
                            : 'border-slate-100 bg-slate-50 opacity-45'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-nba-navy/10 font-display text-xs font-black text-nba-navy">
                            {pos}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {player?.name ?? 'Vazio'}
                            </p>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                              {!onCourt && gameStarted
                                ? 'No banco'
                                : (player?.archetype ?? '')}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-lg border border-slate-200 bg-pf-muted px-2 py-0.5 font-display text-sm font-bold text-slate-700">
                          {player?.overall ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {awayLineup && (
                <div className="border-t border-slate-200/80 pt-4">
                  <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                    Elenco Rival
                  </h2>
                  <div className="grid grid-cols-5 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-center shadow-pf-sm">
                    {Object.entries(awayLineup).map(([pos, player]) => (
                      <div key={pos}>
                        <span className="block text-[10px] font-bold text-slate-400">
                          {pos}
                        </span>
                        <span className="block font-display text-sm font-black leading-tight text-nba-navy">
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
