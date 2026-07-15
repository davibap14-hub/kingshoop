/**
 * Cartas Secretas no estilo Kings League — efeitos especiais no simulador.
 */

export const secretCards = [
  {
    id: 'FOUR_POINT_LINE',
    title: 'Linha de 4 Pontos',
    description:
      'Durante o 2º Quarto, qualquer arremesso de 3 convertido pelo seu time vale 4 pontos.',
    effect: 'FOUR_POINT_LINE',
  },
  {
    id: 'ZONE_LOCK',
    title: 'Zona Trancada',
    description:
      'Durante o 3º Quarto, a Defesa do seu time recebe um bônus multiplicador de 1.25x.',
    effect: 'ZONE_LOCK',
  },
  {
    id: 'DOUBLE_POSSESSION',
    title: 'Posse do Craque',
    description:
      'No 1º Quarto, seu jogador de maior Overall ganha o dobro de chances de finalizar as jogadas.',
    effect: 'DOUBLE_POSSESSION',
  },
  {
    id: 'BENCH_BOOST',
    title: 'Energia do Banco',
    description:
      'Os jogadores que entram vindos do banco recebem +10 de overall temporário.',
    effect: 'BENCH_BOOST',
  },
]

/** Cartas selecionáveis no Vestiário (todas com impacto no motor). */
export const playableSecretCards = secretCards
