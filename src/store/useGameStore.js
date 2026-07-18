import { create } from 'zustand'
import { DEFAULT_ARCHETYPE_ID } from '../data/constants/archetypes'
import { DEFAULT_TEAM_ID, getTeamById } from '../data/teams'
import { gameService } from '../services/gameService'

function pickCareerFields(state) {
  return {
    playerName: state.playerName,
    archetypeId: state.archetypeId,
    player: state.player,
    playerStats: state.playerStats,
    status: state.status,
    careerVariables: state.careerVariables,
    progression: state.progression,
    finance: state.finance,
    contract: state.contract,
    sponsorships: state.sponsorships,
    injury: state.injury,
    pendingEvent: state.pendingEvent,
    lastEventResult: state.lastEventResult,
    lastWeekResult: state.lastWeekResult,
    currentWeek: state.currentWeek,
    currentSeason: state.currentSeason,
    currentTeamId: state.currentTeamId,
    lastEvent: state.lastEvent,
    history: state.history,
    careerStats: state.careerStats,
    leagueHistory: state.leagueHistory,
    relationships: state.relationships,
    relationshipEffects: state.relationshipEffects,
    playingTimeShare: state.playingTimeShare,
    contractEngine: state.contractEngine,
    pendingContractOffer: state.pendingContractOffer,
    season: state.season,
    gm: state.gm,
    weekNews: state.weekNews,
    newsFeed: state.newsFeed,
  }
}

/**
 * Store Zustand — estado da Interface.
 * Lógica de carreira vive na Engine; aqui só aplica `nextState` / `effects`.
 */
export const useGameStore = create((set, get) => {
  const boot = gameService.bootCareer()

  return {
    ...boot.state,
    availableActivities: boot.availableActivities,
    selectedActivityId: boot.availableActivities[0]?.id ?? 'rest',
    weekEffects: boot.state.lastWeekResult ?? null,
    pendingEvent: boot.state.pendingEvent ?? null,
    lastEventResult: boot.state.lastEventResult ?? null,
    activeSaveId: boot.activeSaveId ?? null,
    saveList: gameService.listSaves(),
    lastSaveAt: boot.payload?.updatedAt ?? null,
    lastSaveMessage: boot.isNew
      ? 'Nova carreira — será salva automaticamente após a 1ª semana.'
      : `Save carregado: ${boot.payload?.name ?? 'Carreira'}.`,

    getCurrentTeam: () => getTeamById(get().currentTeamId),

    getOverall: () => {
      const { player, playerStats } = get()
      if (player?.overall) return player.overall
      return gameService.calcOverall(playerStats)
    },

    refreshSaveList: () => set({ saveList: gameService.listSaves() }),

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
      set((state) => {
        const relationships = {
          ...(state.relationships ?? {}),
          ...(patch.relationshipsPatch ?? {}),
        }
        const relationshipEffects =
          gameService.getRelationshipEffects(relationships)
        return {
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
          relationships,
          relationshipEffects,
          playingTimeShare: relationshipEffects.playingTimeShare,
          contract: {
            ...state.contract,
            teamId,
          },
        }
      })
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
     * Auto-save no LocalStorage após sucesso.
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
        pendingContractOffer:
          result.nextState.pendingContractOffer ?? null,
        selectedActivityId:
          result.availableActivities.find((a) => a.id === id)?.id ??
          result.availableActivities[0]?.id ??
          'rest',
        lastEvent: result.effects.messages[result.effects.messages.length - 1],
      })

      const saved = gameService.autoSave(pickCareerFields(get()))
      if (saved.ok) {
        set({
          activeSaveId: saved.payload.id,
          lastSaveAt: saved.payload.updatedAt,
          lastSaveMessage: `Auto-save · Semana ${result.nextState.currentWeek}`,
          saveList: gameService.listSaves(),
        })
      }

      return result
    },

    /**
     * Resolve oferta da Contract Engine + auto-save.
     */
    resolveContractDecision: (decision, terms = {}) => {
      const pending = get().pendingContractOffer
      if (!pending) {
        return { ok: false, error: 'Nenhuma oferta de contrato pendente.' }
      }

      const result = gameService.resolveContractDecision(
        get(),
        decision,
        terms,
      )
      if (!result.ok) {
        set({ lastEvent: result.error })
        return result
      }

      set({
        ...result.nextState,
        pendingContractOffer: result.nextState.pendingContractOffer ?? null,
        lastEvent:
          result.effects.messages?.[result.effects.messages.length - 1] ??
          result.nextState.lastEvent,
      })

      const saved = gameService.autoSave(pickCareerFields(get()))
      if (saved.ok) {
        set({
          activeSaveId: saved.payload.id,
          lastSaveAt: saved.payload.updatedAt,
          lastSaveMessage: 'Auto-save · contrato',
          saveList: gameService.listSaves(),
        })
      }

      return result
    },

    /**
     * Resolve escolha do Event Engine + auto-save.
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

      const saved = gameService.autoSave(pickCareerFields(get()))
      if (saved.ok) {
        set({
          activeSaveId: saved.payload.id,
          lastSaveAt: saved.payload.updatedAt,
          lastSaveMessage: 'Auto-save · evento resolvido',
          saveList: gameService.listSaves(),
        })
      }

      return result
    },

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

    setLuxuryLevel: (luxuryLevel) => {
      const result = gameService.setLuxuryLevel(get(), luxuryLevel)
      if (!result.ok) {
        set({ lastEvent: result.error })
        return result
      }
      set({
        ...result.nextState,
        lastEvent: result.nextState.lastEvent,
      })
      return result
    },

    investCash: (productId, amount) => {
      const result = gameService.investCash(get(), productId, amount)
      if (!result.ok) {
        set({ lastEvent: result.error })
        return result
      }
      set({
        ...result.nextState,
        careerVariables: {
          ...(get().careerVariables ?? {}),
          dinheiro: result.nextState.status.dinheiro,
        },
        lastEvent: result.nextState.lastEvent,
      })
      return result
    },

    /** Cria um novo slot de save a partir do estado atual. */
    createSaveSlot: (name) => {
      const result = gameService.createSave(pickCareerFields(get()), name)
      if (!result.ok) {
        set({ lastSaveMessage: result.error })
        return result
      }
      set({
        activeSaveId: result.payload.id,
        lastSaveAt: result.payload.updatedAt,
        lastSaveMessage: `Save criado: ${result.payload.name}`,
        saveList: gameService.listSaves(),
      })
      return result
    },

    /** Salva manualmente no slot ativo (ou cria). */
    saveNow: (name) => {
      const result = gameService.saveCurrent(pickCareerFields(get()), name)
      if (!result.ok) {
        set({ lastSaveMessage: result.error })
        return result
      }
      set({
        activeSaveId: result.payload.id,
        lastSaveAt: result.payload.updatedAt,
        lastSaveMessage: `Salvo: ${result.payload.name}`,
        saveList: gameService.listSaves(),
      })
      return result
    },

    /** Carrega um save existente. */
    loadSaveSlot: (id) => {
      const result = gameService.loadSave(id)
      if (!result.ok) {
        set({ lastSaveMessage: result.error })
        return result
      }
      set({
        ...result.state,
        availableActivities: result.availableActivities,
        selectedActivityId: result.availableActivities[0]?.id ?? 'rest',
        weekEffects: result.state.lastWeekResult ?? null,
        pendingEvent: result.state.pendingEvent ?? null,
        lastEventResult: result.state.lastEventResult ?? null,
        activeSaveId: result.activeSaveId,
        lastSaveAt: result.payload.updatedAt,
        lastSaveMessage: `Carregado: ${result.payload.name}`,
        saveList: gameService.listSaves(),
      })
      return result
    },

    deleteSaveSlot: (id) => {
      const result = gameService.deleteSave(id)
      if (!result.ok) {
        set({ lastSaveMessage: result.error })
        return result
      }
      const activeSaveId = gameService.getActiveSaveId()
      set({
        activeSaveId,
        saveList: gameService.listSaves(),
        lastSaveMessage: 'Save excluído.',
      })
      return result
    },

    renameSaveSlot: (id, name) => {
      const result = gameService.renameSave(id, name)
      if (!result.ok) {
        set({ lastSaveMessage: result.error })
        return result
      }
      set({
        saveList: gameService.listSaves(),
        lastSaveMessage: `Renomeado: ${name}`,
      })
      return result
    },

    advanceWeek: () => get().runWeek(get().selectedActivityId),

    resetCareer: (archetypeId = DEFAULT_ARCHETYPE_ID) => {
      const bootNext = gameService.startCareer({
        archetypeId,
        currentTeamId: DEFAULT_TEAM_ID,
        lastEvent: 'Nova carreira iniciada.',
      })
      gameService.clearActiveSave()
      set({
        ...bootNext.state,
        availableActivities: bootNext.availableActivities,
        selectedActivityId: bootNext.availableActivities[0]?.id ?? 'rest',
        weekEffects: null,
        pendingEvent: null,
        lastEventResult: null,
        activeSaveId: null,
        lastSaveAt: null,
        lastSaveMessage:
          'Nova carreira — escolha "Novo save" ou avance a semana para auto-salvar.',
        saveList: gameService.listSaves(),
      })
    },
  }
})
