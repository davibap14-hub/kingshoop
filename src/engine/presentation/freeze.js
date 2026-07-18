/**
 * Congela / clona dados da simulação para leitura segura.
 * A Presentation Engine nunca altera o objeto original.
 */

export function freezeMatch(match) {
  if (!match || typeof match !== 'object') return null
  const clone = structuredClone
    ? structuredClone(match)
    : JSON.parse(JSON.stringify(match))
  return Object.freeze(deepFreeze(clone))
}

function deepFreeze(obj) {
  if (!obj || typeof obj !== 'object') return obj
  Object.freeze(obj)
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }
  return obj
}

/** Snapshot raso só para leitura — não congela aninhado se já for frozen */
export function readOnlyMatch(match) {
  if (!match) return null
  return match
}
