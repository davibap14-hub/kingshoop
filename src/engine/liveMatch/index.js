/**
 * Live Match Engine — reproduz o Play-by-Play da Simulation Engine.
 * A Interface só avança frames; nunca recalcula a partida.
 */

export {
  LIVE_MATCH_VERSION,
  LIVE_PLAYBACK_SPEEDS,
  LIVE_BASE_DURATION_MS,
  LIVE_PLAY_FEED_WINDOW,
} from '../../data/liveMatch'

export {
  buildLiveMatchFeed,
  getLiveMatchFrame,
  rescaleLiveFeedSpeed,
} from './build.js'

export { liveWinProbability } from './probability.js'
export {
  normalizePbpEvent,
  extractPlayActors,
} from './parse.js'
