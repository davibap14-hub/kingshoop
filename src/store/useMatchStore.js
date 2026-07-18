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
  fromMatchCenter: false,

  setHomeTeam: (homeTeamId) => set({ homeTeamId }),
  setAwayTeam: (awayTeamId) => set({ awayTeamId }),

  simulate: (gm = null) => {
    const { homeTeamId, awayTeamId } = get()
    set({ isSimulating: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId, gm)
    const presented = gameService.presentMatch(result)
    set({
      lastMatch: result,
      lastPresentation: presented.presentation,
      isSimulating: false,
      fromMatchCenter: Boolean(gm),
    })
    return { match: result, presentation: presented.presentation }
  },

  /**
   * Match Center → Jogar Partida (usa GM da carreira quando disponível).
   */
  playFromMatchCenter: (homeTeamId, awayTeamId, gm = null) => {
    set({ homeTeamId, awayTeamId, isSimulating: true, fromMatchCenter: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId, gm)
    const presented = gameService.presentMatch(result)
    set({
      lastMatch: result,
      lastPresentation: presented.presentation,
      isSimulating: false,
    })
    return { match: result, presentation: presented.presentation }
  },

  clear: () =>
    set({
      lastMatch: null,
      lastPresentation: null,
      fromMatchCenter: false,
    }),
}))
