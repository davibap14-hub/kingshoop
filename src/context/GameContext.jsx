import { useCallback, useMemo, useState } from 'react'
import { performAutoDraft } from '../lib/draft'
import { computeDisplayMetrics } from '../lib/tactics'
import { GameContext } from './gameContext'

const INITIAL_SCORES = { homeScore: 0, awayScore: 0 }

export function GameProvider({ children }) {
  const [homeLineup, setHomeLineup] = useState(null)
  const [awayLineup, setAwayLineup] = useState(null)
  const [homePresident, setHomePresident] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

  const [gameStarted, setGameStarted] = useState(false)
  const [matchEnded, setMatchEnded] = useState(false)
  const [matchKey, setMatchKey] = useState(0)
  const [activePositions, setActivePositions] = useState(['PG'])
  const [globalScores, setGlobalScores] = useState(INITIAL_SCORES)
  const [gamePhase, setGamePhase] = useState('Vestiário')

  const [formation, setFormation] = useState('Equilibrada')
  const [playstyle, setPlaystyle] = useState('Run & Gun')

  const controlsLocked = gameStarted && !matchEnded
  const hasLineup = Boolean(homeLineup)

  const homeMetrics = useMemo(
    () => computeDisplayMetrics(homeLineup, formation, playstyle),
    [homeLineup, formation, playstyle],
  )

  const resetMatchUi = useCallback(() => {
    setGameStarted(false)
    setMatchEnded(false)
    setGamePhase('Pronto para o jogo')
    setActivePositions(['PG'])
    setGlobalScores(INITIAL_SCORES)
  }, [])

  const realizarDraft = useCallback(() => {
    const draft = performAutoDraft()
    setHomeLineup(draft.homeLineup)
    setAwayLineup(draft.awayLineup)
    setHomePresident(draft.homePresident)
    setSelectedCard(draft.selectedCard)
    resetMatchUi()
  }, [resetMatchUi])

  const iniciarPartida = useCallback(() => {
    setMatchKey((k) => k + 1)
    setGameStarted(true)
    setMatchEnded(false)
    setGamePhase('Partida Ativa')
    setGlobalScores(INITIAL_SCORES)
    setActivePositions(['PG'])
  }, [])

  const voltarAoVestiario = useCallback(() => {
    resetMatchUi()
  }, [resetMatchUi])

  const updateScores = useCallback((scores) => {
    setGlobalScores({
      homeScore: scores.homeScore ?? scores.home ?? 0,
      awayScore: scores.awayScore ?? scores.away ?? 0,
    })
  }, [])

  const handleMatchEnd = useCallback(() => {
    setMatchEnded(true)
    setGamePhase('Finalizado')
  }, [])

  const value = useMemo(
    () => ({
      homeLineup,
      awayLineup,
      homePresident,
      selectedCard,
      setSelectedCard,
      gameStarted,
      matchEnded,
      matchKey,
      activePositions,
      setActivePositions,
      globalScores,
      gamePhase,
      setGamePhase,
      formation,
      setFormation,
      playstyle,
      setPlaystyle,
      controlsLocked,
      hasLineup,
      homeMetrics,
      realizarDraft,
      iniciarPartida,
      voltarAoVestiario,
      updateScores,
      handleMatchEnd,
    }),
    [
      homeLineup,
      awayLineup,
      homePresident,
      selectedCard,
      gameStarted,
      matchEnded,
      matchKey,
      activePositions,
      globalScores,
      gamePhase,
      formation,
      playstyle,
      controlsLocked,
      hasLineup,
      homeMetrics,
      realizarDraft,
      iniciarPartida,
      voltarAoVestiario,
      updateScores,
      handleMatchEnd,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
