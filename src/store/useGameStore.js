import { create } from 'zustand'
import { DEFAULT_ARCHETYPE_ID } from '../data/constants/archetypes'
import { DEFAULT_TEAM_ID, getTeamById } from '../data/teams'
import { gameService } from '../services/gameService'

/**
 * Store Zustand — estado da Interface.
 * Lógica de carreira vive na Engine; aqui só aplica `nextState` / `effects`.
 */
export const useGameStore = create((set, get) => {
  const boot = gameService.startCareer()

  return {
    ...boot.state,
    availableActivities: boot.availableActivities,
    selectedActivityId: boot.availableActivities[0]?.id ?? 'rest',
    weekEffects: null,
    pendingEvent: boot.state.pendingEvent ?? null,
    lastEventResult: null,

    getCurrentTeam: () => getTeamById(get().currentTeamId),

    getOverall: () => {
      const { player, playerStats } = get()
      if (player?.overall) return player.overall
      return gameService.calcOverall(playerStats)
    },

    setPlayerName: (name) =>
      set({
        playerName: name.trim() || 'Rookie',
        player: { ...get().player, nome: name.trim() || 'Rookie' },
      }),

    setSelectedActivity: (activityId) => set({ selectedActivityId: activityId }),

    setArchetype: (archetypeId) => {
      const patch = gameService.changeArchetype(archetypeId)
      const availableActivities = gameService.listAvailableActivities({
        ...get(),
        ...patch,
      })
      set({
        ...patch,
        availableActivities,
        selectedActivityId: availableActivities[0]?.id ?? 'rest',
      })
    },

    setTeam: (teamId) => {
      if (!gameService.listTeams().some((t) => t.id === teamId)) return
      const patch = gameService.transferTeam(teamId)
      set((state) => ({
        currentTeamId: patch.currentTeamId,
        lastEvent: patch.lastEvent,
        status: {
          ...state.status,
          ...(patch.statusPatch ?? {}),
        },
        careerVariables: {
          ...state.careerVariables,
          ...(patch.careerVariablesPatch ?? {}),
        },
        contract: {
          ...state.contract,
          teamId,
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

    /**
     * Uma atividade por semana → Career Engine → efeitos na UI.
     */
    runWeek: (activityId) => {
      const id = activityId ?? get().selectedActivityId
      const result = gameService.runWeek(get(), id)

      if (!result.ok) {
        set({
          lastEvent: result.error,
          weekEffects: null,
          availableActivities: result.availableActivities,
          pendingEvent: result.pendingEvent ?? get().pendingEvent,
        })
        return result
      }

      set({
        ...result.nextState,
        weekEffects: result.effects,
        availableActivities: result.availableActivities,
        pendingEvent: result.pendingEvent ?? null,
        selectedActivityId:
          result.availableActivities.find((a) => a.id === id)?.id ??
          result.availableActivities[0]?.id ??
          'rest',
        lastEvent: result.effects.messages[result.effects.messages.length - 1],
      })

      return result
    },

    /**
     * Resolve escolha do Event Engine.
     */
    resolveEventChoice: (choiceId) => {
      const pending = get().pendingEvent
      if (!pending) {
        return { ok: false, error: 'Nenhum evento pendente.' }
      }

      const result = gameService.resolveEvent(get(), pending.id, choiceId)
      if (!result.ok) {
        set({ lastEvent: result.error })
        return result
      }

      set({
        ...result.nextState,
        pendingEvent: null,
        lastEventResult: result.effects,
        lastEvent: result.effects.messages[result.effects.messages.length - 1],
      })

      return result
    },

    /**
     * Gasta 1 ponto de evolução em um grupo (Físico/Arremesso/Defesa/QI).
     */
    spendEvolutionPoint: (groupKey) => {
      const result = gameService.spendEvolutionPoint(get(), groupKey)
      if (!result.ok) {
        set({ lastEvent: result.error })
        return result
      }

      const playerStats = {
        fisico: Math.round(
          (result.nextState.player.fisico.velocidade +
            result.nextState.player.fisico.impulsao +
            result.nextState.player.fisico.forca +
            result.nextState.player.fisico.resistencia) /
            4,
        ),
        arremesso: Math.round(
          (result.nextState.player.arremesso.bandeja +
            result.nextState.player.arremesso.midRange +
            result.nextState.player.arremesso.tresPontos +
            result.nextState.player.arremesso.lanceLivre) /
            4,
        ),
        defesa: Math.round(
          (result.nextState.player.defesa.perimetro +
            result.nextState.player.defesa.garrafao +
            result.nextState.player.defesa.roubo +
            result.nextState.player.defesa.toco) /
            4,
        ),
        inteligencia: Math.round(
          (result.nextState.player.qi.passe +
            result.nextState.player.qi.visao +
            result.nextState.player.qi.tomadaDecisao) /
            3,
        ),
      }

      set({
        ...result.nextState,
        playerStats,
        lastEvent: result.effects.messages[0],
      })

      return result
    },

    /** Compat: avança com a atividade selecionada */
    advanceWeek: () => get().runWeek(get().selectedActivityId),

    resetCareer: (archetypeId = DEFAULT_ARCHETYPE_ID) => {
      const bootNext = gameService.startCareer({
        archetypeId,
        currentTeamId: DEFAULT_TEAM_ID,
        lastEvent: 'Nova carreira iniciada.',
      })
      set({
        ...bootNext.state,
        availableActivities: bootNext.availableActivities,
        selectedActivityId: bootNext.availableActivities[0]?.id ?? 'rest',
        weekEffects: null,
        pendingEvent: null,
        lastEventResult: null,
      })
    },
  }
})
