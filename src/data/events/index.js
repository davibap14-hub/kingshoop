/**
 * Eventos de carreira / semana — dados puros.
 * A Engine sorteia e aplica efeitos.
 */

export const WEEKLY_EVENTS = [
  {
    id: 'media',
    type: 'media',
    weight: 2,
    text: 'Entrevista pós-jogo aumenta a fama.',
    effects: { fama: 2 },
  },
  {
    id: 'locker',
    type: 'locker',
    weight: 2,
    text: 'Conversa no vestiário melhora a química.',
    effects: { quimica: 3 },
  },
  {
    id: 'fatigue',
    type: 'fatigue',
    weight: 1,
    text: 'Carga pesada na semana. Energia baixa.',
    effects: { energia: -10 },
  },
  {
    id: 'sponsor',
    type: 'sponsor',
    weight: 1,
    text: 'Contrato de patrocínio local.',
    effects: { dinheiro: 5000, fama: 1 },
  },
  {
    id: 'none',
    type: 'none',
    weight: 3,
    text: 'Semana tranquila de rotina.',
    effects: {},
  },
]
