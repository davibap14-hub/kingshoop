import { useCallback, useEffect, useRef, useState } from 'react'
import { POSITIONS } from '../lib/draft'
import { computeTeamRatings } from '../lib/tactics'

/**
 * Motor de simulação ao vivo: escalada 1v1→5v5, cartas, presidente, dado do caos e matchball.
 */
export function useMatchEngine({
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
}) {
  const [quarter, setQuarter] = useState(1)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [phase, setPhase] = useState('Escalada 1v1')
  const [feed, setFeed] = useState(['Bola ao alto! O jogo vai começar!'])
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
  const matchballTickRef = useRef(0)
  const minutesRef = useRef(5)
  const secondsRef = useRef(0)
  const quarterRef = useRef(1)

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
  useEffect(() => {
    minutesRef.current = minutes
  }, [minutes])
  useEffect(() => {
    secondsRef.current = seconds
  }, [seconds])
  useEffect(() => {
    quarterRef.current = quarter
  }, [quarter])

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
    adicionarAoFeed(
      `APITO FINAL! Partida Encerrada! Placar: Casa ${home} x ${away} Fora.`,
    )
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
    const q = quarter
    const timeAtacando = Math.random() < 0.52 ? 'home' : 'away'

    const homeBoost =
      activeCard?.effect === 'BENCH_BOOST' ? benchBoostRef.current : null

    const homeRatings = computeTeamRatings(
      homeLineup,
      positions,
      formation,
      playstyle,
      { boostPositions: homeBoost ?? undefined },
    )
    const awayRatings = computeTeamRatings(
      awayLineup,
      positions,
      'Equilibrada',
      'Meia Quadra',
    )

    let homeAttack = homeRatings.attack
    let homeDefense = homeRatings.defense
    let awayAttack = awayRatings.attack
    let awayDefense = awayRatings.defense

    if (activeCard?.effect === 'ZONE_LOCK' && q === 3) {
      homeDefense *= 1.25
    }

    const probabilidadeSucesso =
      timeAtacando === 'home'
        ? homeAttack / (homeAttack + awayDefense)
        : awayAttack / (awayAttack + homeDefense)

    const converteu = Math.random() < probabilidadeSucesso * 0.95

    if (converteu) {
      const threeChance =
        timeAtacando === 'home' ? homeRatings.threeRate : awayRatings.threeRate
      const tipoPonto = Math.random() < threeChance ? 3 : 2
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

      if (timeAtacando === 'home' && playstyle === 'Iso Star') {
        const craque = getHomeStar()
        if (craque && Math.random() < 0.45) cestinha = craque
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
          ? '[FORA] Excelente roubo de bola na transição!'
          : '[CASA] Toco impressionante para inflamar a torcida!',
      )
    }
  }, [
    activeCard,
    adicionarAoFeed,
    awayLineup,
    formation,
    getHomeStar,
    homeLineup,
    playstyle,
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
          'Entrada de Quadra: Os Pivôs (C) entram! Quadra completa em 5v5!',
          'Jogo 5v5',
        )
      } else if (
        tempoDecorrido >= 90 &&
        tempoDecorrido < 120 &&
        !current.includes('PF')
      ) {
        applyEntry(
          ['PG', 'SG', 'SF', 'PF'],
          'Entrada de Quadra: Os Alas-Pivôs (PF) entram! Modificador 4v4.',
          'Escalada 4v4',
        )
      } else if (
        tempoDecorrido >= 60 &&
        tempoDecorrido < 90 &&
        !current.includes('SF')
      ) {
        applyEntry(
          ['PG', 'SG', 'SF'],
          'Entrada de Quadra: Os Alas (SF) entram! Agora jogamos em 3v3.',
          'Escalada 3v3',
        )
      } else if (
        tempoDecorrido >= 30 &&
        tempoDecorrido < 60 &&
        !current.includes('SG')
      ) {
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
        if (q === 1) {
          setActivePositions(['PG', 'SG', 'SF', 'PF', 'C'])
          setPhase('Jogo 5v5')
        }
        return q + 1
      }
      encerrarPartida()
      return q
    })
  }, [adicionarAoFeed, encerrarPartida])

  const rodarDadoDoCaos = useCallback(() => {
    setIsDiceSpinning(true)
    window.setTimeout(() => {
      const lados = [1, 2, 3, 4, 5]
      const sorteado = lados[Math.floor(Math.random() * lados.length)]
      setChaosDiceResult(sorteado)
      chaosDiceResultRef.current = sorteado
      setIsDiceSpinning(false)

      const posicoesSorteados = POSITIONS.slice(0, sorteado)
      setActivePositions(posicoesSorteados)
      setPhase(`Caos ${sorteado}v${sorteado}`)
      adicionarAoFeed(
        `O DADO DO CAOS CAIU EM: ${sorteado}v${sorteado}! Formato travado até o apito final (incluindo Matchball)!`,
      )
      setShowDiceModal(false)
      setIsPlaying(true)
    }, 1500)
  }, [adicionarAoFeed])

  const arremessarPresidente = useCallback(() => {
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
          `CHUÁ! ${presidenteCasa?.shortName || 'O Presidente'} acertou do meio da quadra! +4 PONTOS!`,
        )
      } else {
        adicionarAoFeed(
          'NO ARO! O arremesso do Presidente bateu na borda e saiu!',
        )
      }
      setShowPresidentModal(false)
      setPresidentShotSuccess(null)
      setQuarter(3)
      setMinutes(5)
      setSeconds(0)
      setActivePositions(['PG', 'SG', 'SF', 'PF', 'C'])
      setPhase('Jogo 5v5')
      setIsPlaying(true)
    }, 2000)
  }, [adicionarAoFeed, homeLineup, homePresident])

  useEffect(() => {
    if (!isPlaying || phase === 'Intervalo' || phase === 'Fim') return undefined

    const homePace = computeTeamRatings(
      homeLineup,
      activePositionsRef.current,
      formation,
      playstyle,
    ).pace
    const posessionChance = Math.min(
      0.32,
      Math.max(0.14, 0.22 + homePace * 0.03),
    )

    const interval = window.setInterval(() => {
      if (phaseRef.current === 'Matchball') {
        matchballTickRef.current += 1
        if (matchballTickRef.current % 4 === 0) {
          simularPosseDeBola()
        }
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
          matchballTickRef.current = 0
          setPhase('Matchball')
          const target =
            Math.max(homeScoreRef.current, awayScoreRef.current) + 7
          setTargetScore(target)
          adicionarAoFeed(
            `REGRA MATCHBALL ATIVADA! Cronômetro desligado. Primeiro a ${target} vence! Formato atual preservado.`,
          )
        }
      }

      if (Math.random() < posessionChance) {
        simularPosseDeBola()
      }
    }, 45)

    return () => window.clearInterval(interval)
  }, [
    adicionarAoFeed,
    atualizarEscaladaDoJogo,
    formation,
    homeLineup,
    isPlaying,
    phase,
    playstyle,
    simularPosseDeBola,
    tratarFimDeQuarto,
  ])

  const tipOffLocked =
    showPresidentModal || showDiceModal || phase === 'Intervalo'

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  return {
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
  }
}
