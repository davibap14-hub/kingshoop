import { useCallback, useEffect, useRef, useState } from 'react'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

function teamStrength(lineup, activePositions, boostPositions = null) {
  const onCourt = activePositions
    .map((pos) => {
      const p = lineup?.[pos]
      if (!p) return null
      if (boostPositions?.has(pos)) {
        return {
          ...p,
          attack: p.attack + 10,
          defense: p.defense + 10,
          overall: p.overall + 10,
        }
      }
      return p
    })
    .filter(Boolean)
  if (onCourt.length === 0) return { attack: 0, defense: 0 }
  return {
    attack: Math.round(onCourt.reduce((s, p) => s + p.attack, 0) / onCourt.length),
    defense: Math.round(onCourt.reduce((s, p) => s + p.defense, 0) / onCourt.length),
  }
}

export default function MatchSimulator({
  homeLineup,
  awayLineup,
  homePresident = null,
  activeCard = null,
  onMatchEnd,
  onScoreUpdate,
  onActiveChange,
  onPhaseChange,
}) {
  const [quarter, setQuarter] = useState(1)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [phase, setPhase] = useState('Escalada 1v1')
  const [feed, setFeed] = useState(['Bola ao alto! O jogo vai comecar!'])
  const [activePositions, setActivePositions] = useState(['PG'])
  const [chaosDiceResult, setChaosDiceResult] = useState(null)
  const [targetScore, setTargetScore] = useState(null)

  const [showPresidentModal, setShowPresidentModal] = useState(false)
  const [presidentShotSuccess, setPresidentShotSuccess] = useState(null)
  const [showDiceModal, setShowDiceModal] = useState(false)
  const [isDiceSpinning, setIsDiceSpinning] = useState(false)

  const feedEndRef = useRef(null)
  const homeScoreRef = useRef(0)
  const awayScoreRef = useRef(0)
  const phaseRef = useRef(phase)
  const activePositionsRef = useRef(activePositions)
  const targetScoreRef = useRef(null)
  const chaosDiceResultRef = useRef(null)
  const benchBoostRef = useRef(new Set())

  useEffect(() => {
    homeScoreRef.current = homeScore
  }, [homeScore])
  useEffect(() => {
    awayScoreRef.current = awayScore
  }, [awayScore])
  useEffect(() => {
    phaseRef.current = phase
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])
  useEffect(() => {
    activePositionsRef.current = activePositions
    onActiveChange?.(activePositions)
  }, [activePositions, onActiveChange])
  useEffect(() => {
    targetScoreRef.current = targetScore
  }, [targetScore])
  useEffect(() => {
    chaosDiceResultRef.current = chaosDiceResult
  }, [chaosDiceResult])

  const getHomeStar = useCallback(() => {
    if (!homeLineup) return null
    return Object.values(homeLineup).reduce(
      (max, player) => (player.overall > (max?.overall || 0) ? player : max),
      null,
    )
  }, [homeLineup])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feed])

  useEffect(() => {
    onScoreUpdate?.({ home: homeScore, away: awayScore, homeScore, awayScore })
  }, [homeScore, awayScore, onScoreUpdate])

  const adicionarAoFeed = useCallback((texto) => {
    setFeed((prev) => [...prev, texto].slice(-50))
  }, [])

  const encerrarPartida = useCallback(() => {
    const home = homeScoreRef.current
    const away = awayScoreRef.current
    setPhase('Fim')
    setIsPlaying(false)
    adicionarAoFeed(`APITO FINAL! Partida Encerrada! Placar: Casa ${home} x ${away} Fora.`)
    onMatchEnd?.({ home, away, homeScore: home, awayScore: away })
  }, [adicionarAoFeed, onMatchEnd])

  const verificarMatchballFim = useCallback(
    (home, away) => {
      if (phaseRef.current === 'Matchball' && targetScoreRef.current != null) {
        if (home >= targetScoreRef.current || away >= targetScoreRef.current) {
          encerrarPartida()
        }
      }
    },
    [encerrarPartida],
  )

  const simularPosseDeBola = useCallback(() => {
    const positions = activePositionsRef.current
    const q = quarter // from closure — updated each render via deps
    const timeAtacando = Math.random() < 0.52 ? 'home' : 'away'

    const calcularPoder = (lineup, tipo) => {
      if (!lineup) return 50
      let total = 0
      let ativosCount = 0
      positions.forEach((pos) => {
        if (lineup[pos]) {
          let val = lineup[pos][tipo]
          if (
            activeCard?.effect === 'BENCH_BOOST' &&
            benchBoostRef.current.has(pos) &&
            lineup === homeLineup
          ) {
            val += 10
          }
          total += val
          ativosCount++
        }
      })
      return ativosCount > 0 ? total / ativosCount : 50
    }

    let homeAttack = calcularPoder(homeLineup, 'attack')
    let homeDefense = calcularPoder(homeLineup, 'defense')
    let awayAttack = calcularPoder(awayLineup, 'attack')
    let awayDefense = calcularPoder(awayLineup, 'defense')

    if (activeCard?.effect === 'ZONE_LOCK' && q === 3) {
      homeDefense *= 1.25
    }

    const probabilidadeSucesso =
      timeAtacando === 'home'
        ? homeAttack / (homeAttack + awayDefense)
        : awayAttack / (awayAttack + homeDefense)

    const converteu = Math.random() < probabilidadeSucesso * 0.95

    if (converteu) {
      const tipoPonto = Math.random() < 0.35 ? 3 : 2
      let pontosGanhos = tipoPonto

      if (
        timeAtacando === 'home' &&
        activeCard?.effect === 'FOUR_POINT_LINE' &&
        q === 2 &&
        tipoPonto === 3
      ) {
        pontosGanhos = 4
      }

      const elenco = timeAtacando === 'home' ? homeLineup : awayLineup
      let cestinha = elenco
        ? elenco[positions[Math.floor(Math.random() * positions.length)]]
        : null

      if (
        timeAtacando === 'home' &&
        activeCard?.effect === 'DOUBLE_POSSESSION' &&
        q === 1
      ) {
        const craque = getHomeStar()
        if (craque && Math.random() < 0.6) {
          cestinha = craque
        }
      }

      const nomeJogador = cestinha ? cestinha.shortName : 'Atleta'

      if (timeAtacando === 'home') {
        setHomeScore((prev) => {
          const novo = prev + pontosGanhos
          homeScoreRef.current = novo
          verificarMatchballFim(novo, awayScoreRef.current)
          return novo
        })
        adicionarAoFeed(
          `[CASA] ${nomeJogador} mete uma bola de ${pontosGanhos} pontos!`,
        )
      } else {
        setAwayScore((prev) => {
          const novo = prev + pontosGanhos
          awayScoreRef.current = novo
          verificarMatchballFim(homeScoreRef.current, novo)
          return novo
        })
        adicionarAoFeed(
          `[FORA] ${nomeJogador} converte para ${pontosGanhos} pontos.`,
        )
      }
    } else if (Math.random() < 0.3) {
      adicionarAoFeed(
        timeAtacando === 'home'
          ? '[FORA] Excelente roubo de bola na transicao!'
          : '[CASA] Toco impressionante para inflamar a torcida!',
      )
    }
  }, [
    activeCard,
    adicionarAoFeed,
    awayLineup,
    getHomeStar,
    homeLineup,
    quarter,
    verificarMatchballFim,
  ])

  const atualizarEscaladaDoJogo = useCallback(
    (mins, secs) => {
      if (chaosDiceResultRef.current != null) return

      const tempoDecorrido = 300 - (mins * 60 + secs)
      const current = activePositionsRef.current

      const applyEntry = (next, label, phaseLabel) => {
        const newcomers = next.filter((p) => !current.includes(p))
        if (activeCard?.effect === 'BENCH_BOOST') {
          newcomers.forEach((p) => benchBoostRef.current.add(p))
        }
        setActivePositions(next)
        setPhase(phaseLabel)
        const boostNote =
          activeCard?.effect === 'BENCH_BOOST' && newcomers.length
            ? ' (+10 OVR Energia do Banco)'
            : ''
        adicionarAoFeed(`${label}${boostNote}`)
      }

      if (tempoDecorrido >= 120 && !current.includes('C')) {
        applyEntry(
          ['PG', 'SG', 'SF', 'PF', 'C'],
          'Entrada de Quadra: Os Pivos (C) entram! Quadra completa em 5v5!',
          'Jogo 5v5',
        )
      } else if (tempoDecorrido >= 90 && tempoDecorrido < 120 && !current.includes('PF')) {
        applyEntry(
          ['PG', 'SG', 'SF', 'PF'],
          'Entrada de Quadra: Os Alas-Pivos (PF) entram! Modificador 4v4.',
          'Escalada 4v4',
        )
      } else if (tempoDecorrido >= 60 && tempoDecorrido < 90 && !current.includes('SF')) {
        applyEntry(
          ['PG', 'SG', 'SF'],
          'Entrada de Quadra: Os Alas (SF) entram! Agora jogamos em 3v3.',
          'Escalada 3v3',
        )
      } else if (tempoDecorrido >= 30 && tempoDecorrido < 60 && !current.includes('SG')) {
        applyEntry(
          ['PG', 'SG'],
          'Entrada de Quadra: Os Alas-Armadores (SG) entram! Vira 2v2.',
          'Escalada 2v2',
        )
      }
    },
    [activeCard, adicionarAoFeed],
  )

  const tratarFimDeQuarto = useCallback(() => {
    setQuarter((q) => {
      if (q < 4) {
        if (q === 2) {
          setPhase('Intervalo')
          setIsPlaying(false)
          setShowPresidentModal(true)
          return q
        }
        adicionarAoFeed(`Fim do ${q}º Quarto. Iniciando o ${q + 1}º Quarto!`)
        setMinutes(5)
        setSeconds(0)
        return q + 1
      }
      encerrarPartida()
      return q
    })
  }, [adicionarAoFeed, encerrarPartida])

  const rodarDadoDoCaos = () => {
    setIsDiceSpinning(true)
    window.setTimeout(() => {
      const lados = [1, 2, 3, 5]
      const sorteado = lados[Math.floor(Math.random() * lados.length)]
      setChaosDiceResult(sorteado)
      chaosDiceResultRef.current = sorteado
      setIsDiceSpinning(false)

      let posicoesSorteados = ['PG']
      if (sorteado >= 2) posicoesSorteados.push('SG')
      if (sorteado >= 3) posicoesSorteados.push('SF')
      if (sorteado === 5) {
        posicoesSorteados = ['PG', 'SG', 'SF', 'PF', 'C']
      }

      setActivePositions(posicoesSorteados)
      setPhase(`Caos ${sorteado}v${sorteado}`)
      adicionarAoFeed(
        `O DADO DO CAOS CAIU EM: ${sorteado}v${sorteado}! Formato travado ate o apito final (incluindo Matchball)!`,
      )
      setShowDiceModal(false)
      setIsPlaying(true)
    }, 1500)
  }

  const arremessarPresidente = () => {
    const presidenteCasa =
      homePresident ||
      Object.values(homeLineup || {}).find((p) => p.isPresident)
    const chance = presidenteCasa ? presidenteCasa.overall / 200 : 0.25

    const acertou = Math.random() < chance
    setPresidentShotSuccess(acertou)

    window.setTimeout(() => {
      if (acertou) {
        setHomeScore((prev) => {
          const novo = prev + 4
          homeScoreRef.current = novo
          return novo
        })
        adicionarAoFeed(
          `CHUA! ${presidenteCasa?.shortName || 'O Presidente'} acertou do meio da quadra! +4 PONTOS!`,
        )
      } else {
        adicionarAoFeed(
          'NO ARO! O arremesso do Presidente bateu na borda e saiu!',
        )
      }
      setShowPresidentModal(false)
      setQuarter(3)
      setMinutes(5)
      setSeconds(0)
      setPhase('Jogo 5v5')
      setIsPlaying(true)
    }, 2000)
  }

  const minutesRef = useRef(5)
  const secondsRef = useRef(0)
  const quarterRef = useRef(1)

  useEffect(() => {
    minutesRef.current = minutes
  }, [minutes])
  useEffect(() => {
    secondsRef.current = seconds
  }, [seconds])
  useEffect(() => {
    quarterRef.current = quarter
  }, [quarter])

  // Loop de simulacao (~45ms por segundo virtual)
  useEffect(() => {
    if (!isPlaying || phase === 'Intervalo' || phase === 'Fim') return undefined

    const interval = window.setInterval(() => {
      if (phaseRef.current === 'Matchball') {
        simularPosseDeBola()
        return
      }

      let mins = minutesRef.current
      let secs = secondsRef.current
      const q = quarterRef.current

      if (secs > 0) {
        secs -= 1
      } else if (mins > 0) {
        mins -= 1
        secs = 59
      } else {
        tratarFimDeQuarto()
        return
      }

      minutesRef.current = mins
      secondsRef.current = secs
      setMinutes(mins)
      setSeconds(secs)

      if (q === 1) {
        atualizarEscaladaDoJogo(mins, secs)
      }

      if (
        q === 4 &&
        mins === 2 &&
        secs === 0 &&
        chaosDiceResultRef.current == null
      ) {
        setIsPlaying(false)
        setShowDiceModal(true)
        return
      }

      if (
        q === 4 &&
        mins === 1 &&
        secs === 0 &&
        phaseRef.current !== 'Matchball'
      ) {
        const diff = Math.abs(homeScoreRef.current - awayScoreRef.current)
        if (diff <= 8) {
          // Preserva activePositions atuais (formato do Dado)
          setPhase('Matchball')
          const target =
            Math.max(homeScoreRef.current, awayScoreRef.current) + 7
          setTargetScore(target)
          adicionarAoFeed(
            `REGRA MATCHBALL ATIVADA! Cronometro desligado. Primeiro a ${target} vence! Formato atual preservado.`,
          )
        }
      }

      if (Math.random() < 0.22) {
        simularPosseDeBola()
      }
    }, 45)

    return () => window.clearInterval(interval)
  }, [
    adicionarAoFeed,
    atualizarEscaladaDoJogo,
    isPlaying,
    phase,
    simularPosseDeBola,
    tratarFimDeQuarto,
  ])

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-700/60 bg-card-dark p-4 text-white shadow-lg">
      <div className="mb-2 flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Casa
          </p>
          <span className="text-4xl font-extrabold tracking-tight text-court-orange">
            {homeScore}
          </span>
        </div>
        <div className="rounded-lg border border-slate-700/30 bg-slate-900/60 px-4 py-1 text-center">
          <span className="block text-xs font-bold uppercase text-kings-green">
            {phase}
          </span>
          <span className="font-mono text-2xl font-bold tracking-widest">
            {phase === 'Matchball'
              ? 'MATCHBALL'
              : `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">Q{quarter}</span>
          {targetScore != null && phase === 'Matchball' && (
            <span className="mt-0.5 block text-[10px] font-semibold text-court-orange">
              Alvo {targetScore}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Fora
          </p>
          <span className="text-4xl font-extrabold tracking-tight text-slate-300">
            {awayScore}
          </span>
        </div>
      </div>

      {activeCard && (
        <div className="animate-card-glow mb-3 flex items-center justify-between rounded-lg border border-kings-green/40 bg-kings-green/10 px-3 py-1.5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-kings-green">
              {activeCard.title}
            </p>
            <p className="text-[10px] leading-tight text-slate-300">
              {activeCard.description}
            </p>
          </div>
          <span className="shrink-0 rounded bg-kings-green px-1.5 py-0.5 text-[9px] font-bold text-slate-950">
            ATIVO
          </span>
        </div>
      )}

      <div className="my-2 flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Jogadores em Quadra
        </p>
        <div className="flex w-full justify-around gap-1">
          {POSITIONS.map((pos) => {
            const isActive = activePositions.includes(pos)
            return (
              <div
                key={pos}
                className={`flex-1 rounded-lg border py-2 text-center transition-all duration-300 ${
                  isActive
                    ? 'border-kings-green bg-kings-green/10 text-kings-green shadow-[0_0_8px_rgba(46,196,182,0.25)]'
                    : 'border-slate-800 bg-slate-900/40 text-slate-600 line-through opacity-40'
                }`}
              >
                <span className="block text-xs font-black">{pos}</span>
                <span className="block font-mono text-[9px]">
                  {isActive ? homeLineup?.[pos]?.shortName || 'Vazio' : 'Banco'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="my-2 flex max-h-[160px] flex-1 flex-col gap-1.5 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 font-mono text-xs">
        {feed.map((entry, idx) => (
          <div
            key={`${idx}-${entry.slice(0, 12)}`}
            className={`border-l-2 py-0.5 pl-2 ${
              entry.includes('[CASA]')
                ? 'border-court-orange text-orange-200'
                : entry.includes('[FORA]')
                  ? 'border-slate-400 text-slate-300'
                  : entry.includes('DADO') || entry.includes('MATCHBALL')
                    ? 'border-kings-green bg-kings-green/5 font-bold text-kings-green'
                    : 'border-slate-700 text-slate-400'
            }`}
          >
            {entry}
          </div>
        ))}
        <div ref={feedEndRef} />
      </div>

      <div className="mt-3 flex gap-2">
        {phase !== 'Fim' && (
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              isPlaying
                ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-kings-green bg-kings-green font-black text-slate-950 shadow-[0_0_12px_rgba(46,196,182,0.3)] hover:bg-opacity-90'
            }`}
          >
            {isPlaying ? 'Pausar Partida' : 'Dar o Tip-Off'}
          </button>
        )}
      </div>

      {showPresidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-kings-green/40 bg-card-dark p-6 text-center shadow-2xl">
            <h3 className="mb-2 font-display text-2xl tracking-wide text-kings-green">
              Arremesso do Presidente!
            </h3>
            <p className="mb-6 text-xs leading-relaxed text-slate-300">
              Halftime!{' '}
              {homePresident?.name || 'Seu presidente'} tenta o chute de 4 pontos
              do meio da quadra.
            </p>

            {presidentShotSuccess === null ? (
              <button
                type="button"
                onClick={arremessarPresidente}
                className="w-full rounded-xl bg-kings-green py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)] hover:bg-opacity-90"
              >
                Disparar Bola!
              </button>
            ) : (
              <div className="py-2">
                <span
                  className={`block text-lg font-bold ${
                    presidentShotSuccess ? 'text-kings-green' : 'text-red-400'
                  }`}
                >
                  {presidentShotSuccess
                    ? 'ACERTOU EM CHEIO! (+4 PTS)'
                    : 'NO ARO! Errou o alvo!'}
                </span>
                <span className="mt-1 block text-[10px] text-slate-400">
                  Retornando para a quadra em instantes...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {showDiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-court-orange/40 bg-card-dark p-6 text-center shadow-2xl">
            <div
              className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-court-orange bg-dark-bg font-display text-3xl text-court-orange ${
                isDiceSpinning ? 'animate-dice-spin' : ''
              }`}
            >
              {isDiceSpinning ? '?' : 'D4'}
            </div>
            <h3 className="mb-2 font-display text-2xl tracking-wide text-court-orange">
              Dado do Caos!
            </h3>
            <p className="mb-6 text-xs leading-relaxed text-slate-300">
              Cronometro travado aos 2:00 do ultimo quarto. O dado define o
              formato ate o fim!
            </p>

            <button
              type="button"
              disabled={isDiceSpinning}
              onClick={rodarDadoDoCaos}
              className="w-full rounded-xl bg-court-orange py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-opacity-90 disabled:opacity-50"
            >
              {isDiceSpinning ? 'Sorteando...' : 'Girar o Dado!'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { POSITIONS, teamStrength }
