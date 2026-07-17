import { useGameStore } from '../store/useGameStore'

/** Selectors / hooks da Interface — consomem store (que aplica resultados da Engine). */

export function useCareerSnapshot() {
  const playerName = useGameStore((s) => s.playerName)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const playerStats = useGameStore((s) => s.playerStats)
  const careerVariables = useGameStore((s) => s.careerVariables)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const lastEvent = useGameStore((s) => s.lastEvent)
  const getOverall = useGameStore((s) => s.getOverall)
  const getCurrentTeam = useGameStore((s) => s.getCurrentTeam)

  return {
    playerName,
    archetypeId,
    playerStats,
    careerVariables,
    currentWeek,
    currentSeason,
    currentTeamId,
    lastEvent,
    overall: getOverall(),
    team: getCurrentTeam(),
  }
}

export function useCareerActions() {
  return useGameStore((s) => ({
    setPlayerName: s.setPlayerName,
    setArchetype: s.setArchetype,
    setTeam: s.setTeam,
    updateStat: s.updateStat,
    updateCareer: s.updateCareer,
    advanceWeek: s.advanceWeek,
    resetCareer: s.resetCareer,
  }))
}
