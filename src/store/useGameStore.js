import { create } from 'zustand'
import { DEFAULT_ARCHETYPE_ID } from '../data/constants/archetypes'
import { DEFAULT_CAREER } from '../data/constants/career'
import { DEFAULT_TEAM_ID, getTeamById } from '../data/teams'
import { gameService } from '../services/gameService'

/**
 * Store Zustand — estado da Interface.
 * Regras: lógica de jogo vive na Engine; aqui só guarda estado e aplica patches.
 */
export const useGameStore = create((set, get) => ({
  ...gameService.createInitialState(),

  getCurrentTeam: () => getTeamById(get().currentTeamId),

  getOverall: () => gameService.calcOverall(get().playerStats),

  setPlayerName: (name) => set({ playerName: name.trim() || 'Rookie' }),

  setArchetype: (archetypeId) => {
    const patch = gameService.changeArchetype(archetypeId)
    set(patch)
  },

  setTeam: (teamId) => {
    if (!gameService.listTeams().some((t) => t.id === teamId)) return
    const patch = gameService.transferTeam(teamId)
    set((state) => ({
      currentTeamId: patch.currentTeamId,
      lastEvent: patch.lastEvent,
      careerVariables: {
        ...state.careerVariables,
        ...patch.careerVariablesPatch,
      },
    }))
  },

  updateStat: (statKey, delta) => {
    const result = gameService.updateStat(get().playerStats, statKey, delta)
    if (!result.changed) return

    set({
      playerStats: result.playerStats,
      lastEvent: `${statKey}: ${result.previous} → ${result.next} (${delta > 0 ? '+' : ''}${delta})`,
    })
  },

  updateCareer: (key, delta) => {
    const next = gameService.updateCareer(get().careerVariables, key, delta)
    set({ careerVariables: next })
  },

  advanceWeek: () => {
    const patch = gameService.advanceWeek(get())
    set({
      currentWeek: patch.currentWeek,
      currentSeason: patch.currentSeason,
      careerVariables: patch.careerVariables,
      lastEvent: patch.lastEvent,
    })
  },

  resetCareer: (archetypeId = DEFAULT_ARCHETYPE_ID) => {
    set(
      gameService.createInitialState({
        archetypeId,
        playerStats: gameService.buildInitialStats(archetypeId),
        careerVariables: { ...DEFAULT_CAREER },
        currentWeek: 1,
        currentSeason: 1,
        currentTeamId: DEFAULT_TEAM_ID,
        lastEvent: 'Nova carreira iniciada.',
      }),
    )
  },
}))
