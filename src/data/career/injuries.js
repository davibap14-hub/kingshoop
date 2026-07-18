/**
 * Compat — tipos de lesão da carreira apontam para a Injury Engine.
 */

import { INJURY_CATALOG } from '../injuries'

/** @deprecated use INJURY_CATALOG from data/injuries */
export const INJURY_TYPES = INJURY_CATALOG.map((t) => ({
  id: t.id,
  label: t.label,
  severity: t.severity === 'light' ? 'mild' : t.severity,
  weeks: t.weeks,
  blocksTraining: t.blocksTraining,
  weight: t.weight,
}))
