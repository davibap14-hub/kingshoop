import { create } from 'zustand'
import { gameService } from '../services/gameService'

/**
 * Store da Draft Night — só guarda o broadcast e o índice do frame.
 * Escolhas e DTOs vêm da Draft Night Engine.
 */
export const useDraftNightStore = create((set, get) => ({
  broadcast: null,
  mode: null,
  isBuilding: false,
  lastError: null,

  clear: () =>
    set({
      broadcast: null,
      mode: null,
      isBuilding: false,
      lastError: null,
    }),

  setBroadcast: (broadcast) => set({ broadcast }),

  startLive: (careerState) => {
    set({ isBuilding: true, lastError: null })
    const built = gameService.buildDraftNightLive(careerState)
    if (!built.ok) {
      set({ isBuilding: false, lastError: built.error, broadcast: null })
      return built
    }
    set({
      isBuilding: false,
      broadcast: built.broadcast,
      mode: 'live',
      lastError: null,
    })
    return built
  },

  startReplay: (careerState) => {
    set({ isBuilding: true, lastError: null })
    const built = gameService.buildDraftNightReplay(careerState)
    if (!built.ok) {
      set({ isBuilding: false, lastError: built.error, broadcast: null })
      return built
    }
    set({
      isBuilding: false,
      broadcast: built.broadcast,
      mode: 'replay',
      lastError: null,
    })
    return built
  },

  rescaleSpeed: (speedId) => {
    const { broadcast } = get()
    if (!broadcast) return
    set({
      broadcast: gameService.rescaleDraftNightSpeed(broadcast, speedId),
    })
  },
}))
