/**
 * Catálogo estático de árbitros — dados, sem lógica de simulação.
 */

export const REFEREE_CREW = [
  {
    id: 'ref_scott',
    name: 'Marcus Scott',
    role: 'crew_chief',
    style: 'Apito firme',
    tendency: 'Protege o ritmo; poucas faltas tontas.',
  },
  {
    id: 'ref_alvarez',
    name: 'Elena Alvarez',
    role: 'umpire',
    style: 'Contato permitido',
    tendency: 'Deixa o jogo físico no perímetro.',
  },
  {
    id: 'ref_nguyen',
    name: 'David Nguyen',
    role: 'umpire',
    style: 'Técnicas raras',
    tendency: 'Foca em illegal screens e box-outs.',
  },
  {
    id: 'ref_okafor',
    name: 'Amara Okafor',
    role: 'crew_chief',
    style: 'Jogo fluido',
    tendency: 'Menos interrupções em transição.',
  },
  {
    id: 'ref_bianchi',
    name: 'Luca Bianchi',
    role: 'umpire',
    style: 'Verticalidade',
    tendency: 'Premia contest limpo no paint.',
  },
  {
    id: 'ref_hayes',
    name: 'Jordan Hayes',
    role: 'umpire',
    style: 'Disciplina',
    tendency: 'Rápido em unsportsmanlike.',
  },
  {
    id: 'ref_costa',
    name: 'Sofia Costa',
    role: 'crew_chief',
    style: 'Equilíbrio',
    tendency: 'Marca falta de ataque com consistência.',
  },
  {
    id: 'ref_park',
    name: 'Kenji Park',
    role: 'umpire',
    style: 'Perímetro',
    tendency: 'Atenção a hand-checks em stars.',
  },
]

export const REFEREE_ROLE_LABELS = {
  crew_chief: 'Crew Chief',
  umpire: 'Umpire',
}
