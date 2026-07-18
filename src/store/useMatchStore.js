import { create } from 'zustand'
import { gameService } from '../services/gameService'

/**
 * Store só guarda o resultado da Simulation Engine + pacote Presentation.
 * Nenhuma lógica de posse aqui — Presentation nunca altera a simulação.
 */
export const useMatchStore = create((set, get) => ({
  homeTeamId: 'gsw',
  awayTeamId: 'bos',
  lastMatch: null,
  lastPresentation: null,
  isSimulating: false,

  setHomeTeam: (homeTeamId) => set({ homeTeamId }),
  setAwayTeam: (awayTeamId) => set({ awayTeamId }),

  simulate: () => {
    const { homeTeamId, awayTeamId } = get()
    set({ isSimulating: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId)
    const presented = gameService.presentMatch(result)
    set({
      lastMatch: result,
      lastPresentation: presented.presentation,
      isSimulating: false,
    })
    return { match: result, presentation: presented.presentation }
  },

  clear: () => set({ lastMatch: null, lastPresentation: null }),
}))
