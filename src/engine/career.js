/**
 * Motor de jogo — lógica de simulação (treino, partidas, eventos).
 * Placeholder para a próxima etapa de desenvolvimento.
 */

export function calcTrainingGain(statKey, energy, bias = 1) {
  if (energy < 15) return 0
  const base = 0.6 + Math.random() * 1.4
  return Math.round(base * bias * 10) / 10
}

export function rollWeeklyEvent() {
  const events = [
    { type: 'media', text: 'Entrevista pós-jogo aumenta a fama.', fama: 2 },
    { type: 'locker', text: 'Conversa no vestiário melhora a química.', quimica: 3 },
    { type: 'fatigue', text: 'Carga pesada na semana. Energia baixa.', energia: -10 },
    { type: 'sponsor', text: 'Contrato de patrocínio local.', dinheiro: 5000, fama: 1 },
    { type: 'none', text: 'Semana tranquila de rotina.' },
  ]
  return events[Math.floor(Math.random() * events.length)]
}
