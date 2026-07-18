import { HOF_CLASSIFICATION } from '../../data/hallOfFame'

/**
 * Classifica o resultado da votação HOF.
 * Primeira votação · Hall da Fama · Não entrou
 */
export function classifyHofScore(score) {
  const s = Number(score) || 0
  if (s >= HOF_CLASSIFICATION.first_ballot.minScore) {
    return HOF_CLASSIFICATION.first_ballot
  }
  if (s >= HOF_CLASSIFICATION.hall_of_fame.minScore) {
    return HOF_CLASSIFICATION.hall_of_fame
  }
  return HOF_CLASSIFICATION.not_inducted
}

export function isHofInducted(classificationId) {
  return (
    classificationId === HOF_CLASSIFICATION.first_ballot.id ||
    classificationId === HOF_CLASSIFICATION.hall_of_fame.id
  )
}
