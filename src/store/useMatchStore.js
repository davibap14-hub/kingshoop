import { create } from 'zustand'
import { gameService } from '../services/gameService'

/**
 * Store só guarda resultado da Simulation + Presentation + Live feed.
 * Nenhuma lógica de posse / re-simulação aqui.
 */
export const useMatchStore = create((set, get) => ({
  homeTeamId: 'gsw',
  awayTeamId: 'bos',
  lastMatch: null,
  lastPresentation: null,
  lastLiveFeed: null,
  isSimulating: false,
  fromMatchCenter: false,

  setHomeTeam: (homeTeamId) => set({ homeTeamId }),
  setAwayTeam: (awayTeamId) => set({ awayTeamId }),
  setLiveFeed: (lastLiveFeed) => set({ lastLiveFeed }),

  simulate: (gm = null) => {
    const { homeTeamId, awayTeamId } = get()
    set({ isSimulating: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId, gm)
    const presented = gameService.presentMatch(result)
    const live = gameService.buildLiveMatchFeed(result)
    set({
      lastMatch: result,
      lastPresentation: presented.presentation,
      lastLiveFeed: live.ok ? live.feed : null,
      isSimulating: false,
      fromMatchCenter: Boolean(gm),
    })
    return {
      match: result,
      presentation: presented.presentation,
      liveFeed: live.ok ? live.feed : null,
    }
  },

  playFromMatchCenter: (homeTeamId, awayTeamId, gm = null) => {
    set({ homeTeamId, awayTeamId, isSimulating: true, fromMatchCenter: true })
    const result = gameService.runDefaultMatch(homeTeamId, awayTeamId, gm)
    const presented = gameService.presentMatch(result)
    const live = gameService.buildLiveMatchFeed(result)
    set({
      lastMatch: result,
      lastPresentation: presented.presentation,
      lastLiveFeed: live.ok ? live.feed : null,
      isSimulating: false,
    })
    return {
      match: result,
      presentation: presented.presentation,
      liveFeed: live.ok ? live.feed : null,
    }
  },

  clear: () =>
    set({
      lastMatch: null,
      lastPresentation: null,
      lastLiveFeed: null,
      fromMatchCenter: false,
    }),
}))
