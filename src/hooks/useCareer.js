import { useGameStore } from '../store/useGameStore'

/** Selectors / hooks da Interface — consomem store (resultados da Engine). */

export function useCareerSnapshot() {
  const playerName = useGameStore((s) => s.playerName)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const playerStats = useGameStore((s) => s.playerStats)
  const player = useGameStore((s) => s.player)
  const status = useGameStore((s) => s.status)
  const careerVariables = useGameStore((s) => s.careerVariables)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const lastEvent = useGameStore((s) => s.lastEvent)
  const injury = useGameStore((s) => s.injury)
  const contract = useGameStore((s) => s.contract)
  const sponsorships = useGameStore((s) => s.sponsorships)
  const finance = useGameStore((s) => s.finance)
  const progression = useGameStore((s) => s.progression)
  const weekEffects = useGameStore((s) => s.weekEffects)
  const availableActivities = useGameStore((s) => s.availableActivities)
  const getOverall = useGameStore((s) => s.getOverall)
  const getCurrentTeam = useGameStore((s) => s.getCurrentTeam)

  return {
    playerName,
    archetypeId,
    playerStats,
    player,
    status,
    careerVariables,
    currentWeek,
    currentSeason,
    currentTeamId,
    lastEvent,
    injury,
    contract,
    sponsorships,
    finance,
    progression,
    weekEffects,
    availableActivities,
    overall: getOverall(),
    team: getCurrentTeam(),
  }
}

export function useCareerActions() {
  return useGameStore((s) => ({
    setPlayerName: s.setPlayerName,
    setArchetype: s.setArchetype,
    setTeam: s.setTeam,
    setSelectedActivity: s.setSelectedActivity,
    updateStat: s.updateStat,
    updateCareer: s.updateCareer,
    runWeek: s.runWeek,
    advanceWeek: s.advanceWeek,
    resetCareer: s.resetCareer,
  }))
}
