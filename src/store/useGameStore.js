import { create } from 'zustand'
import {
  ARCHETYPES,
  ATTRIBUTE_KEYS,
  CAREER_KEYS,
  CAREER_VARIABLES,
  DEFAULT_CAREER,
  DEFAULT_TEAM_ID,
  TEAMS,
  WEEKS_PER_SEASON,
} from '../data/constants'

function clamp(value, min, max) {
  if (max == null) return Math.max(min, value)
  return Math.max(min, Math.min(max, value))
}

function buildInitialStats(archetypeId = 'twoWay') {
  const archetype = ARCHETYPES[archetypeId] ?? ARCHETYPES.twoWay
  return { ...archetype.baseStats }
}

export const useGameStore = create((set, get) => ({
  // --- Estado ---
  playerName: 'Rookie',
  archetypeId: 'twoWay',
  playerStats: buildInitialStats('twoWay'),
  careerVariables: { ...DEFAULT_CAREER },
  currentWeek: 1,
  currentSeason: 1,
  currentTeamId: DEFAULT_TEAM_ID,
  lastEvent: 'Bem-vindo à carreira. Prepare-se para a Semana 1.',

  // --- Getters derivados (via seletores no componente ou aqui) ---
  getCurrentTeam: () => {
    const { currentTeamId } = get()
    return TEAMS.find((t) => t.id === currentTeamId) ?? TEAMS[0]
  },

  getOverall: () => {
    const stats = get().playerStats
    const sum = ATTRIBUTE_KEYS.reduce((acc, key) => acc + (stats[key] ?? 0), 0)
    return Math.round(sum / ATTRIBUTE_KEYS.length)
  },

  // --- Ações ---
  setPlayerName: (name) => set({ playerName: name.trim() || 'Rookie' }),

  setArchetype: (archetypeId) => {
    if (!ARCHETYPES[archetypeId]) return
    set({
      archetypeId,
      playerStats: buildInitialStats(archetypeId),
      lastEvent: `Arquétipo definido: ${ARCHETYPES[archetypeId].label}.`,
    })
  },

  setTeam: (teamId) => {
    if (!TEAMS.some((t) => t.id === teamId)) return
    set({
      currentTeamId: teamId,
      careerVariables: {
        ...get().careerVariables,
        quimica: 50,
      },
      lastEvent: `Transferido para ${TEAMS.find((t) => t.id === teamId)?.name}.`,
    })
  },

  /**
   * Atualiza um atributo do jogador (fisico, arremesso, defesa, inteligencia).
   */
  updateStat: (statKey, delta) => {
    if (!ATTRIBUTE_KEYS.includes(statKey)) return

    set((state) => {
      const current = state.playerStats[statKey] ?? 0
      const next = clamp(Math.round(current + delta), 0, 99)
      return {
        playerStats: {
          ...state.playerStats,
          [statKey]: next,
        },
        lastEvent:
          delta === 0
            ? state.lastEvent
            : `${statKey}: ${current} → ${next} (${delta > 0 ? '+' : ''}${delta})`,
      }
    })
  },

  /**
   * Atualiza uma variável de carreira (energia, dinheiro, fama, quimica).
   */
  updateCareer: (key, delta) => {
    if (!CAREER_KEYS.includes(key)) return
    const meta = CAREER_VARIABLES[key]

    set((state) => {
      const current = state.careerVariables[key] ?? 0
      const next = clamp(Math.round(current + delta), meta.min, meta.max)
      return {
        careerVariables: {
          ...state.careerVariables,
          [key]: next,
        },
      }
    })
  },

  /**
   * Avança uma semana: consome energia, gera salário básico e recupera um pouco.
   */
  advanceWeek: () => {
    const state = get()
    const energyCost = 8 + Math.floor(Math.random() * 7)
    const paycheck = 2500 + Math.round(state.getOverall() * 40)
    const fameGain = Math.random() < 0.35 ? 1 : 0
    const chemDelta = Math.random() < 0.5 ? 1 : -1

    let nextWeek = state.currentWeek + 1
    let nextSeason = state.currentSeason
    if (nextWeek > WEEKS_PER_SEASON) {
      nextWeek = 1
      nextSeason += 1
    }

    const energyAfter = clamp(
      state.careerVariables.energia - energyCost + 12,
      0,
      100,
    )

    set({
      currentWeek: nextWeek,
      currentSeason: nextSeason,
      careerVariables: {
        energia: energyAfter,
        dinheiro: state.careerVariables.dinheiro + paycheck,
        fama: clamp(state.careerVariables.fama + fameGain, 0, 100),
        quimica: clamp(state.careerVariables.quimica + chemDelta, 0, 100),
      },
      lastEvent: `Semana ${state.currentWeek} concluída. Salário +$${paycheck.toLocaleString('en-US')}. Energia −${energyCost}.`,
    })
  },

  resetCareer: (archetypeId = 'twoWay') => {
    set({
      playerName: 'Rookie',
      archetypeId,
      playerStats: buildInitialStats(archetypeId),
      careerVariables: { ...DEFAULT_CAREER },
      currentWeek: 1,
      currentSeason: 1,
      currentTeamId: DEFAULT_TEAM_ID,
      lastEvent: 'Nova carreira iniciada.',
    })
  },
}))
