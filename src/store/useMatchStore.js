import { create } from 'zustand'
import { gameService } from '../services/gameService'

/**
 * Store só guarda o resultado da Match Engine para a Interface exibir.
 * Nenhuma lógica de posse aqui.
 */
export const useMatchStore = create((set, get) => ({
  homeTeamId: 'gsw',
  awayTeamId: 'bos',
  lastMatch: null,
  isSimulating: false,

  setHomeTeam: (homeTeamId) => set({ homeTeamId }),
  setAwayTeam: (awayTeamId) => set({ awayTeamId }),

  simulate: () => {
    const { homeTeamId, awayTeamId } = get()
    set({ isSimulating: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId)
    set({ lastMatch: result, isSimulating: false })
    return result
  },

  clear: () => set({ lastMatch: null }),
}))
