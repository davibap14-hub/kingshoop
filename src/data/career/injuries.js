/** Tipos de lesão — dados puros para a Career Engine. */

export const INJURY_TYPES = [
  {
    id: 'ankle_sprain',
    label: 'Entorse no Tornozelo',
    severity: 'mild',
    weeks: [1, 2],
    blocksTraining: true,
    weight: 4,
  },
  {
    id: 'groin_strain',
    label: 'Lesão na Virilha',
    severity: 'moderate',
    weeks: [2, 3],
    blocksTraining: true,
    weight: 3,
  },
  {
    id: 'knee_bruise',
    label: 'Contusão no Joelho',
    severity: 'mild',
    weeks: [1, 2],
    blocksTraining: true,
    weight: 3,
  },
  {
    id: 'back_spasm',
    label: 'Contratura nas Costas',
    severity: 'moderate',
    weeks: [2, 4],
    blocksTraining: true,
    weight: 2,
  },
  {
    id: 'shoulder_strain',
    label: 'Distensão no Ombro',
    severity: 'moderate',
    weeks: [2, 3],
    blocksTraining: true,
    weight: 2,
  },
  {
    id: 'fatigue_collapse',
    label: 'Exaustão Muscular',
    severity: 'mild',
    weeks: [1, 1],
    blocksTraining: true,
    weight: 2,
  },
]
