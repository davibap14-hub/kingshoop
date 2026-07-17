import { useContext } from 'react'
import { GameContext } from '../context/gameContext'

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame deve ser usado dentro de GameProvider')
  }
  return ctx
}
