import { DNA_KEYS, DNA_LABELS, DNA_MAX_DRIFT } from '../../data/dna/constants.js'
import { ensurePlayerDna } from './normalize.js'

function dominantTraits(dna, limit = 4) {
  return DNA_KEYS.map((key) => ({
    key,
    label: DNA_LABELS[key],
    value: dna[key],
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function styleSummary(dna) {
  const prefs = [
    { key: 'preferenciaInfiltracao', label: 'infiltração' },
    { key: 'preferenciaArremesso', label: 'arremesso' },
    { key: 'preferenciaPasse', label: 'passe' },
    { key: 'preferenciaContraAtaque', label: 'contra-ataque' },
  ].sort((a, b) => dna[b.key] - dna[a.key])

  const primary = prefs[0]
  const secondary = prefs[1]
  return `Joga com ênfase em ${primary.label}, apoiado por ${secondary.label}.`
}

export function getDnaView(state = {}) {
  const raw = state.player ?? null

  if (!raw) {
    return {
      available: false,
      traits: [],
      dominant: [],
      summary: '',
      maxDrift: DNA_MAX_DRIFT,
      lastLog: state.lastWeekResult?.dna?.log ?? [],
    }
  }

  const player = ensurePlayerDna(raw)
  const traits = DNA_KEYS.map((key) => ({
    key,
    label: DNA_LABELS[key],
    value: player.dna[key],
    anchor: player.dnaAnchor[key],
    drift: Number((player.dna[key] - player.dnaAnchor[key]).toFixed(1)),
  }))

  return {
    available: true,
    playerId: player.id,
    playerName: player.nome ?? state.playerName ?? 'Jogador',
    traits,
    dominant: dominantTraits(player.dna),
    summary: styleSummary(player.dna),
    maxDrift: DNA_MAX_DRIFT,
    lastLog: state.lastWeekResult?.dna?.log ?? [],
  }
}
