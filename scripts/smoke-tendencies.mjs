import { PLAYERS } from '../src/data/players/database.js'
import { TENDENCY_KEYS } from '../src/data/players/schema.js'
import { buildDefaultMatchup } from '../src/engine/match/lineups.js'
import { simulateGame } from '../src/engine/simulation/game.js'

const sample = PLAYERS[0]
const missing = TENDENCY_KEYS.filter(
  (k) => sample.tendencias?.[k] == null || sample.tendencias[k] < 0 || sample.tendencias[k] > 100,
)
if (missing.length) {
  console.error('Player missing/invalid tendencies', sample.id, missing)
  process.exit(1)
}

let seed = 11
const rng = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0xffffffff
}

const result = simulateGame(buildDefaultMatchup('gsw', 'bos'), { rng })
const actions = new Set(result.playByPlay.map((e) => e.action))
console.log(
  JSON.stringify(
    {
      player: sample.nome,
      tendencias: sample.tendencias,
      score: [result.homeScore, result.awayScore],
      pbp: result.playByPlay.length,
      styleActions: ['alley_oop', 'step_back', 'fadeaway'].filter((a) =>
        actions.has(a),
      ),
    },
    null,
    2,
  ),
)
