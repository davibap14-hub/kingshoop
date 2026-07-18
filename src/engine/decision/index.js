/**
 * Decision Engine — cérebro da simulação.
 *
 * Decide todas as ações de uma posse com sistema de pesos:
 * Atributos · Tendências · Personalidade · Química · Coach ·
 * Fadiga · Momentum · Matchup · Placar · Tempo · Pressão · Importância
 *
 * Nunca utiliza apenas números aleatórios.
 *
 * A Simulation Engine consome esta API em toda posse.
 */

export {
  DECISION_IDS,
  SITUATION_FACTOR_WEIGHTS,
  PRESSURE_MOMENTS,
} from '../../data/decision'

export {
  buildPossessionDecisionContext,
  personality,
} from './context.js'

export {
  situationBundle,
  personalityFactors,
  scoreCandidate,
} from './factors.js'

export { decide, decideDuel } from './decide.js'

export {
  decideBallHandler,
  decidePrimaryDefender,
  decideHelpDefender,
  decideStealer,
  decideScreener,
  decideCutter,
  decideReceiver,
  decideDriver,
  decideIsolationPlayer,
  decideShooter,
  decideRebounder,
  decidePasser,
  decidePostPlayer,
  // compat Simulation Engine
  pickBallHandler,
  pickIndividualDefender,
  pickHelpDefender,
  pickScreener,
  pickCutter,
  pickKickTarget,
  pickRebounder,
  pickPasser,
} from './roles.js'

export { decideOffensiveSet } from './sets.js'
