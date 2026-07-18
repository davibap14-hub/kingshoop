/**
 * @deprecated Catálogo fixo legado — o fluxo semanal usa a Story Engine
 * procedural (`data/story` + `engine/story`). Mantido só para referência.
 *
 * Catálogo de 80 eventos de carreira — dados puros.
 * Categorias: Treino, Família, Dinheiro, Mídia, Companheiros,
 * Lesões, Treinador, Patrocínio, NBA, Torcedores.
 */

export const CAREER_EVENTS = [
  {
    "id": "evt_treino_001",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "O personal sugere carga extra na academia.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar carga",
        "texto": "Você escolheu: Aceitar carga.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Manter plano",
        "texto": "Você escolheu: Manter plano.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Focar técnica",
        "texto": "Você escolheu: Focar técnica.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "d",
        "label": "Pedir avaliação",
        "texto": "Você escolheu: Pedir avaliação.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_002",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Você erra a mecânica no arremesso lateral.",
    "escolhas": [
      {
        "id": "a",
        "label": "Repetir 200 vezes",
        "texto": "Você escolheu: Repetir 200 vezes.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Filmar e corrigir",
        "texto": "Você escolheu: Filmar e corrigir.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Parar por hoje",
        "texto": "Você escolheu: Parar por hoje.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_003",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Um scout aparece no treino aberto.",
    "escolhas": [
      {
        "id": "a",
        "label": "Treinar intenso",
        "texto": "Você escolheu: Treinar intenso.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Jogar seguro",
        "texto": "Você escolheu: Jogar seguro.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Conversar com o scout",
        "texto": "Você escolheu: Conversar com o scout.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "d",
        "label": "Ignorar pressão",
        "texto": "Você escolheu: Ignorar pressão.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_004",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Fadiga aparece no drill de transição.",
    "escolhas": [
      {
        "id": "a",
        "label": "Insistir",
        "texto": "Você escolheu: Insistir.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Reduzir ritmo",
        "texto": "Você escolheu: Reduzir ritmo.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Encerrar sessão",
        "texto": "Você escolheu: Encerrar sessão.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_005",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Companheiro desafia você no 1v1 pós-treino.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Recusar educadamente",
        "texto": "Você escolheu: Recusar educadamente.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Propor 1v1 amanhã",
        "texto": "Você escolheu: Propor 1v1 amanhã.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_006",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Nova dieta do nutricionista chega.",
    "escolhas": [
      {
        "id": "a",
        "label": "Seguir à risca",
        "texto": "Você escolheu: Seguir à risca.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Adaptar",
        "texto": "Você escolheu: Adaptar.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_007",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Você descobre um vídeo antigo de erro técnico.",
    "escolhas": [
      {
        "id": "a",
        "label": "Estudar o vídeo",
        "texto": "Você escolheu: Estudar o vídeo.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Apagar e seguir",
        "texto": "Você escolheu: Apagar e seguir.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir ajuda ao coach",
        "texto": "Você escolheu: Pedir ajuda ao coach.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_treino_008",
    "categoria": "treino",
    "categoriaLabel": "Treino",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {
      "minEnergia": 15
    },
    "efeitos": {},
    "texto": "Equipamento novo de performance é oferecido.",
    "escolhas": [
      {
        "id": "a",
        "label": "Testar",
        "texto": "Você escolheu: Testar.",
        "efeitos": {
          "energia": -2,
          "motivacao": 6,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir análise médica",
        "texto": "Você escolheu: Pedir análise médica.",
        "efeitos": {
          "energia": -6,
          "motivacao": 3
        }
      },
      {
        "id": "d",
        "label": "Negociar exclusividade",
        "texto": "Você escolheu: Negociar exclusividade.",
        "efeitos": {
          "energia": -11
        }
      }
    ]
  },
  {
    "id": "evt_familia_009",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Sua mãe liga pedindo sua presença num jantar.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ir ao jantar",
        "texto": "Você escolheu: Ir ao jantar.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Mandar presentes",
        "texto": "Você escolheu: Mandar presentes.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Prometer próximo mês",
        "texto": "Você escolheu: Prometer próximo mês.",
        "efeitos": {
          "motivacao": 5
        }
      },
      {
        "id": "d",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_010",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Seu irmão pede ajuda financeira.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ajudar generosamente",
        "texto": "Você escolheu: Ajudar generosamente.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Ajudar o mínimo",
        "texto": "Você escolheu: Ajudar o mínimo.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "motivacao": 5
        }
      },
      {
        "id": "d",
        "label": "Emprestar com juros zero",
        "texto": "Você escolheu: Emprestar com juros zero.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_011",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Parente posta foto sua sem autorização.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pedir remoção",
        "texto": "Você escolheu: Pedir remoção.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Transformar em conteúdo",
        "texto": "Você escolheu: Transformar em conteúdo.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_012",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Aniversário do pai coincide com viagem do time.",
    "escolhas": [
      {
        "id": "a",
        "label": "Faltar ao voo",
        "texto": "Você escolheu: Faltar ao voo.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Ligar e mandar presente",
        "texto": "Você escolheu: Ligar e mandar presente.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Convidar o pai depois",
        "texto": "Você escolheu: Convidar o pai depois.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_013",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Família sugere mudar de agente.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ouvir a ideia",
        "texto": "Você escolheu: Ouvir a ideia.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Manter agente",
        "texto": "Você escolheu: Manter agente.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Marcar reunião a três",
        "texto": "Você escolheu: Marcar reunião a três.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_014",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Prima pede ingressos para o próximo jogo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Dar ingressos VIP",
        "texto": "Você escolheu: Dar ingressos VIP.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Dar comuns",
        "texto": "Você escolheu: Dar comuns.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Recusar por política do clube",
        "texto": "Você escolheu: Recusar por política do clube.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_015",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Discussão em casa sobre sua carreira.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ouvir com calma",
        "texto": "Você escolheu: Ouvir com calma.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Sair da conversa",
        "texto": "Você escolheu: Sair da conversa.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Pedir apoio total",
        "texto": "Você escolheu: Pedir apoio total.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_familia_016",
    "categoria": "familia",
    "categoriaLabel": "Família",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Avó fica doente e a família pede visita.",
    "escolhas": [
      {
        "id": "a",
        "label": "Visitar imediatamente",
        "texto": "Você escolheu: Visitar imediatamente.",
        "efeitos": {
          "motivacao": 8,
          "dinheiro": -2500,
          "energia": -5
        }
      },
      {
        "id": "b",
        "label": "Enviar ajuda",
        "texto": "Você escolheu: Enviar ajuda.",
        "efeitos": {
          "motivacao": 5,
          "dinheiro": -800
        }
      },
      {
        "id": "c",
        "label": "Esperar folga",
        "texto": "Você escolheu: Esperar folga.",
        "efeitos": {
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_017",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Uma startup oferece equity em troca de divulgação.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Pedir cash + equity",
        "texto": "Você escolheu: Pedir cash + equity.",
        "efeitos": {
          "dinheiro": -1500,
          "motivacao": -2
        }
      },
      {
        "id": "d",
        "label": "Consultar agente",
        "texto": "Você escolheu: Consultar agente.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_018",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Conta inesperada do imposto chega.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pagar à vista",
        "texto": "Você escolheu: Pagar à vista.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Parcelar",
        "texto": "Você escolheu: Parcelar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Contestar",
        "texto": "Você escolheu: Contestar.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_019",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Amigo pede investimento num restaurante.",
    "escolhas": [
      {
        "id": "a",
        "label": "Investir alto",
        "texto": "Você escolheu: Investir alto.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Investir baixo",
        "texto": "Você escolheu: Investir baixo.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": -1500,
          "motivacao": -2
        }
      },
      {
        "id": "d",
        "label": "Pedir sócio minoritário",
        "texto": "Você escolheu: Pedir sócio minoritário.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_020",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Você encontra um erro a seu favor no contracheque.",
    "escolhas": [
      {
        "id": "a",
        "label": "Avisar o time",
        "texto": "Você escolheu: Avisar o time.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Ficar quieto",
        "texto": "Você escolheu: Ficar quieto.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Perguntar ao agente",
        "texto": "Você escolheu: Perguntar ao agente.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_021",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Corretor oferece imóvel acima do orçamento.",
    "escolhas": [
      {
        "id": "a",
        "label": "Comprar",
        "texto": "Você escolheu: Comprar.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Esperar",
        "texto": "Você escolheu: Esperar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Alugar",
        "texto": "Você escolheu: Alugar.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_022",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Aposta entre jogadores no vestiário.",
    "escolhas": [
      {
        "id": "a",
        "label": "Apostar",
        "texto": "Você escolheu: Apostar.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Sugerir doação",
        "texto": "Você escolheu: Sugerir doação.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_023",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Cartão de crédito estoura o limite.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pagar total",
        "texto": "Você escolheu: Pagar total.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Parcelar",
        "texto": "Você escolheu: Parcelar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Cortar gastos",
        "texto": "Você escolheu: Cortar gastos.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_dinheiro_024",
    "categoria": "dinheiro",
    "categoriaLabel": "Dinheiro",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Oportunidade de flip de sneakers raros.",
    "escolhas": [
      {
        "id": "a",
        "label": "Comprar lote",
        "texto": "Você escolheu: Comprar lote.",
        "efeitos": {
          "dinheiro": 13600,
          "motivacao": 2,
          "popularidade": 1
        }
      },
      {
        "id": "b",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "dinheiro": 2000,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Revender com cuidado",
        "texto": "Você escolheu: Revender com cuidado.",
        "efeitos": {
          "dinheiro": -1800,
          "motivacao": -2
        }
      }
    ]
  },
  {
    "id": "evt_midia_025",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {
      "energia": -1
    },
    "texto": "Jornalista provoca sobre sua defesa.",
    "escolhas": [
      {
        "id": "a",
        "label": "Responder com classe",
        "texto": "Você escolheu: Responder com classe.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Criticar de volta",
        "texto": "Você escolheu: Criticar de volta.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2,
          "relTreinador": -3
        }
      },
      {
        "id": "d",
        "label": "Postar números",
        "texto": "Você escolheu: Postar números.",
        "efeitos": {
          "popularidade": 2
        }
      }
    ]
  },
  {
    "id": "evt_midia_026",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {
      "energia": -1
    },
    "texto": "Podcast convida você ao vivo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Pedir pauta fechada",
        "texto": "Você escolheu: Pedir pauta fechada.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_midia_027",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {
      "energia": -1
    },
    "texto": "Fake news sobre sua vida pessoal viraliza.",
    "escolhas": [
      {
        "id": "a",
        "label": "Processar",
        "texto": "Você escolheu: Processar.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Desmentir",
        "texto": "Você escolheu: Desmentir.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Silêncio",
        "texto": "Você escolheu: Silêncio.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2,
          "relTreinador": -3
        }
      },
      {
        "id": "d",
        "label": "Humor no stories",
        "texto": "Você escolheu: Humor no stories.",
        "efeitos": {
          "popularidade": 2
        }
      }
    ]
  },
  {
    "id": "evt_midia_028",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {
      "energia": -1
    },
    "texto": "Revista pede ensaio fashion polêmico.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Negociar look",
        "texto": "Você escolheu: Negociar look.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_midia_029",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {
      "energia": -1
    },
    "texto": "Comentarista diz que você é “sistema”.",
    "escolhas": [
      {
        "id": "a",
        "label": "Treinar mais",
        "texto": "Você escolheu: Treinar mais.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Confrontar",
        "texto": "Você escolheu: Confrontar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_midia_030",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {
      "minPopularidade": 20
    },
    "efeitos": {
      "energia": -1
    },
    "texto": "Câmera te pega discutindo com o juiz.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pedir desculpas",
        "texto": "Você escolheu: Pedir desculpas.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Justificar",
        "texto": "Você escolheu: Justificar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Sumir das redes",
        "texto": "Você escolheu: Sumir das redes.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_midia_031",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "minPopularidade": 20
    },
    "efeitos": {
      "energia": -1
    },
    "texto": "Série documental quer te acompanhar.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Aceitar com cláusula",
        "texto": "Você escolheu: Aceitar com cláusula.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_midia_032",
    "categoria": "midia",
    "categoriaLabel": "Mídia",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {
      "minPopularidade": 20
    },
    "efeitos": {
      "energia": -1
    },
    "texto": "Você é trend topic após uma cesta decisiva.",
    "escolhas": [
      {
        "id": "a",
        "label": "Engajar fãs",
        "texto": "Você escolheu: Engajar fãs.",
        "efeitos": {
          "popularidade": 9,
          "motivacao": 4,
          "relTreinador": 1
        }
      },
      {
        "id": "b",
        "label": "Ficar offline",
        "texto": "Você escolheu: Ficar offline.",
        "efeitos": {
          "popularidade": 6,
          "motivacao": 2
        }
      },
      {
        "id": "c",
        "label": "Doar merch",
        "texto": "Você escolheu: Doar merch.",
        "efeitos": {
          "popularidade": 2,
          "relTreinador": -3
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_033",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Veterano critica sua leitura de jogo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ouvir",
        "texto": "Você escolheu: Ouvir.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Rebater",
        "texto": "Você escolheu: Rebater.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir film session",
        "texto": "Você escolheu: Pedir film session.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_034",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Rookie pede mentoria.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Indicar outro",
        "texto": "Você escolheu: Indicar outro.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_035",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Briga no vestiário sobe o tom.",
    "escolhas": [
      {
        "id": "a",
        "label": "Mediar",
        "texto": "Você escolheu: Mediar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Tomar partido",
        "texto": "Você escolheu: Tomar partido.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Sair fora",
        "texto": "Você escolheu: Sair fora.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "d",
        "label": "Chamar o capitão",
        "texto": "Você escolheu: Chamar o capitão.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_036",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Colega esquece de te dar o passe fácil.",
    "escolhas": [
      {
        "id": "a",
        "label": "Conversar",
        "texto": "Você escolheu: Conversar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Revidar na próxima",
        "texto": "Você escolheu: Revidar na próxima.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_037",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Grupo marca jantar sem te avisar.",
    "escolhas": [
      {
        "id": "a",
        "label": "Confrontar",
        "texto": "Você escolheu: Confrontar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Seguir em frente",
        "texto": "Você escolheu: Seguir em frente.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Organizar o próximo",
        "texto": "Você escolheu: Organizar o próximo.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_038",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Parceiro de marcação pede troca de esquema.",
    "escolhas": [
      {
        "id": "a",
        "label": "Apoiar",
        "texto": "Você escolheu: Apoiar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Levar ao coach",
        "texto": "Você escolheu: Levar ao coach.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_039",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Alguém usa seu fone sem pedir.",
    "escolhas": [
      {
        "id": "a",
        "label": "Cobrar",
        "texto": "Você escolheu: Cobrar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Deixar pra lá",
        "texto": "Você escolheu: Deixar pra lá.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Brincar",
        "texto": "Você escolheu: Brincar.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_companheiros_040",
    "categoria": "companheiros",
    "categoriaLabel": "Companheiros",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Time vota o capitão da semana.",
    "escolhas": [
      {
        "id": "a",
        "label": "Se candidatar",
        "texto": "Você escolheu: Se candidatar.",
        "efeitos": {
          "relCompanheiros": 9,
          "motivacao": 4,
          "energia": -3
        }
      },
      {
        "id": "b",
        "label": "Indicar amigo",
        "texto": "Você escolheu: Indicar amigo.",
        "efeitos": {
          "relCompanheiros": 6,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Ficar neutro",
        "texto": "Você escolheu: Ficar neutro.",
        "efeitos": {
          "relCompanheiros": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_041",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {
      "requiresInjury": true
    },
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Fisioterapeuta detecta inflamação leve.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pausar",
        "texto": "Você escolheu: Pausar.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Treinar leve",
        "texto": "Você escolheu: Treinar leve.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Esconder sintomas",
        "texto": "Você escolheu: Esconder sintomas.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_042",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Você sente fisgada no joelho no aquecimento.",
    "escolhas": [
      {
        "id": "a",
        "label": "Parar",
        "texto": "Você escolheu: Parar.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Continuar",
        "texto": "Você escolheu: Continuar.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Pedir exame",
        "texto": "Você escolheu: Pedir exame.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_043",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {
      "requiresInjury": true
    },
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Médico sugere infiltracão.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Segunda opinião",
        "texto": "Você escolheu: Segunda opinião.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_044",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Companheiro te derruba sem querer no treino.",
    "escolhas": [
      {
        "id": "a",
        "label": "Reagir bem",
        "texto": "Você escolheu: Reagir bem.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Cobrar",
        "texto": "Você escolheu: Cobrar.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Evitar contato",
        "texto": "Você escolheu: Evitar contato.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_045",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {
      "requiresInjury": true
    },
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Dor nas costas volta à noite.",
    "escolhas": [
      {
        "id": "a",
        "label": "Recovery total",
        "texto": "Você escolheu: Recovery total.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Analgésico e seguir",
        "texto": "Você escolheu: Analgésico e seguir.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Avisar staff",
        "texto": "Você escolheu: Avisar staff.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_046",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Seguro do time questiona um exame.",
    "escolhas": [
      {
        "id": "a",
        "label": "Insistir",
        "texto": "Você escolheu: Insistir.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Chamar agente",
        "texto": "Você escolheu: Chamar agente.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_047",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "requiresInjury": true
    },
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Você vê colega treinando lesionado.",
    "escolhas": [
      {
        "id": "a",
        "label": "Alertar staff",
        "texto": "Você escolheu: Alertar staff.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Apoiar em silêncio",
        "texto": "Você escolheu: Apoiar em silêncio.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Imitar foco",
        "texto": "Você escolheu: Imitar foco.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_lesoes_048",
    "categoria": "lesoes",
    "categoriaLabel": "Lesões",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {
      "motivacao": -1
    },
    "texto": "Alta médica chega mais cedo que o esperado.",
    "escolhas": [
      {
        "id": "a",
        "label": "Voltar já",
        "texto": "Você escolheu: Voltar já.",
        "efeitos": {
          "energia": 12,
          "motivacao": 3,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Pedir mais 1 semana",
        "texto": "Você escolheu: Pedir mais 1 semana.",
        "efeitos": {
          "energia": 4,
          "motivacao": 1
        }
      },
      {
        "id": "c",
        "label": "Testar em 2v2",
        "texto": "Você escolheu: Testar em 2v2.",
        "efeitos": {
          "energia": -8,
          "motivacao": -4,
          "relTreinador": -2
        }
      }
    ]
  },
  {
    "id": "evt_treinador_049",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Coach muda seu papel para 3&D.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Questionar",
        "texto": "Você escolheu: Questionar.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir minutos de criação",
        "texto": "Você escolheu: Pedir minutos de criação.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_050",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Bronca dura após erro defensivo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Assumir",
        "texto": "Você escolheu: Assumir.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Explicar",
        "texto": "Você escolheu: Explicar.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Ficar calado",
        "texto": "Você escolheu: Ficar calado.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_051",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Coach pede para você marcar o astro rival.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar desafio",
        "texto": "Você escolheu: Aceitar desafio.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Pedir ajuda",
        "texto": "Você escolheu: Pedir ajuda.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_052",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Rotação te deixa no banco no 4º quarto.",
    "escolhas": [
      {
        "id": "a",
        "label": "Conversar",
        "texto": "Você escolheu: Conversar.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Treinar mais",
        "texto": "Você escolheu: Treinar mais.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Estourar",
        "texto": "Você escolheu: Estourar.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_053",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Técnico elogia você na coletiva.",
    "escolhas": [
      {
        "id": "a",
        "label": "Agradecer",
        "texto": "Você escolheu: Agradecer.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Dividir crédito",
        "texto": "Você escolheu: Dividir crédito.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir mais bola",
        "texto": "Você escolheu: Pedir mais bola.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_054",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {
      "minRelTreinador": 30
    },
    "efeitos": {},
    "texto": "Sistema novo confunde você.",
    "escolhas": [
      {
        "id": "a",
        "label": "Estudar film",
        "texto": "Você escolheu: Estudar film.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Improvisar",
        "texto": "Você escolheu: Improvisar.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir simplificação",
        "texto": "Você escolheu: Pedir simplificação.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_055",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "minRelTreinador": 30
    },
    "efeitos": {},
    "texto": "Coach sugere mudança de peso.",
    "escolhas": [
      {
        "id": "a",
        "label": "Seguir",
        "texto": "Você escolheu: Seguir.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Negociar",
        "texto": "Você escolheu: Negociar.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_treinador_056",
    "categoria": "treinador",
    "categoriaLabel": "Treinador",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {
      "minRelTreinador": 30
    },
    "efeitos": {},
    "texto": "Reunião individual sobre liderança.",
    "escolhas": [
      {
        "id": "a",
        "label": "Assumir voz",
        "texto": "Você escolheu: Assumir voz.",
        "efeitos": {
          "relTreinador": 11,
          "motivacao": 5,
          "relCompanheiros": 1
        }
      },
      {
        "id": "b",
        "label": "Manter perfil baixo",
        "texto": "Você escolheu: Manter perfil baixo.",
        "efeitos": {
          "relTreinador": 7,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir tempo",
        "texto": "Você escolheu: Pedir tempo.",
        "efeitos": {
          "relTreinador": 2,
          "motivacao": 1
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_057",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Marca de bebida quer ativação polêmica.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Pedir roteiro limpo",
        "texto": "Você escolheu: Pedir roteiro limpo.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_058",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Contrato de tênis inclui cláusula de uso.",
    "escolhas": [
      {
        "id": "a",
        "label": "Assinar",
        "texto": "Você escolheu: Assinar.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Renegociar",
        "texto": "Você escolheu: Renegociar.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_059",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Patrocinador atrasa pagamento.",
    "escolhas": [
      {
        "id": "a",
        "label": "Cobrar duro",
        "texto": "Você escolheu: Cobrar duro.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Esperar",
        "texto": "Você escolheu: Esperar.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Ameacar processar",
        "texto": "Você escolheu: Ameacar processar.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_060",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Marca local oferece cache baixo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar por exposição",
        "texto": "Você escolheu: Aceitar por exposição.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Pedir dobro",
        "texto": "Você escolheu: Pedir dobro.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_061",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {
      "minPopularidade": 25
    },
    "efeitos": {},
    "texto": "Conflito entre duas marcas suas.",
    "escolhas": [
      {
        "id": "a",
        "label": "Escolher a maior",
        "texto": "Você escolheu: Escolher a maior.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Mediar",
        "texto": "Você escolheu: Mediar.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Sair das duas",
        "texto": "Você escolheu: Sair das duas.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_062",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {
      "minPopularidade": 25
    },
    "efeitos": {},
    "texto": "Campanha exige post diário.",
    "escolhas": [
      {
        "id": "a",
        "label": "Cumprir",
        "texto": "Você escolheu: Cumprir.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Autopilot",
        "texto": "Você escolheu: Autopilot.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Renegociar frequência",
        "texto": "Você escolheu: Renegociar frequência.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_063",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "minPopularidade": 25
    },
    "efeitos": {},
    "texto": "Patrocinador quer você em evento na off.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ir",
        "texto": "Você escolheu: Ir.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Mandar representante",
        "texto": "Você escolheu: Mandar representante.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_patrocinio_064",
    "categoria": "patrocinio",
    "categoriaLabel": "Patrocínio",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {
      "minPopularidade": 25
    },
    "efeitos": {},
    "texto": "Nova marca de streetwear te corteja.",
    "escolhas": [
      {
        "id": "a",
        "label": "Fechar",
        "texto": "Você escolheu: Fechar.",
        "efeitos": {
          "dinheiro": 10000,
          "popularidade": 7,
          "energia": -4
        }
      },
      {
        "id": "b",
        "label": "Pedir equity",
        "texto": "Você escolheu: Pedir equity.",
        "efeitos": {
          "dinheiro": 4000,
          "popularidade": 4,
          "energia": -4
        }
      },
      {
        "id": "c",
        "label": "Esperar",
        "texto": "Você escolheu: Esperar.",
        "efeitos": {
          "dinheiro": -500,
          "popularidade": 1,
          "energia": -4
        }
      }
    ]
  },
  {
    "id": "evt_nba_065",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "A liga investiga uma discussão no banco.",
    "escolhas": [
      {
        "id": "a",
        "label": "Cooperar",
        "texto": "Você escolheu: Cooperar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Ficar em silêncio",
        "texto": "Você escolheu: Ficar em silêncio.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir advogado",
        "texto": "Você escolheu: Pedir advogado.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_066",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "All-Star fan vote abre.",
    "escolhas": [
      {
        "id": "a",
        "label": "Fazer campanha",
        "texto": "Você escolheu: Fazer campanha.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Jogar quieto",
        "texto": "Você escolheu: Jogar quieto.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir apoio do time",
        "texto": "Você escolheu: Pedir apoio do time.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_067",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Trade rumor te coloca em outro time.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Pedir meeting",
        "texto": "Você escolheu: Pedir meeting.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Abraçar a ideia",
        "texto": "Você escolheu: Abraçar a ideia.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_068",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Multa da liga por gestual.",
    "escolhas": [
      {
        "id": "a",
        "label": "Pagar",
        "texto": "Você escolheu: Pagar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Apelar",
        "texto": "Você escolheu: Apelar.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Doar valor equivalente",
        "texto": "Você escolheu: Doar valor equivalente.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_069",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "NBA muda regra que afeta seu jogo.",
    "escolhas": [
      {
        "id": "a",
        "label": "Adaptar",
        "texto": "Você escolheu: Adaptar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Reclamar",
        "texto": "Você escolheu: Reclamar.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Estudar rivais",
        "texto": "Você escolheu: Estudar rivais.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_070",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Convite para USA Basketball ID camp.",
    "escolhas": [
      {
        "id": "a",
        "label": "Aceitar",
        "texto": "Você escolheu: Aceitar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Pedir garantia de minutos",
        "texto": "Você escolheu: Pedir garantia de minutos.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_071",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {
      "minWeek": 4
    },
    "efeitos": {},
    "texto": "Horário de tip-off national TV.",
    "escolhas": [
      {
        "id": "a",
        "label": "Preparar ritual",
        "texto": "Você escolheu: Preparar ritual.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Ansiedade controlada",
        "texto": "Você escolheu: Ansiedade controlada.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Treinar menos",
        "texto": "Você escolheu: Treinar menos.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_nba_072",
    "categoria": "nba",
    "categoriaLabel": "NBA",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {
      "minWeek": 4
    },
    "efeitos": {},
    "texto": "Draft de colegas muda o leste.",
    "escolhas": [
      {
        "id": "a",
        "label": "Analisar matchups",
        "texto": "Você escolheu: Analisar matchups.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 5,
          "dinheiro": -1500,
          "relTreinador": 2
        }
      },
      {
        "id": "b",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "popularidade": 4,
          "motivacao": 3
        }
      },
      {
        "id": "c",
        "label": "Ajustar preparação",
        "texto": "Você escolheu: Ajustar preparação.",
        "efeitos": {
          "popularidade": 1,
          "motivacao": 1,
          "relTreinador": -1
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_073",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 1,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Torcida canta seu nome no aquecimento.",
    "escolhas": [
      {
        "id": "a",
        "label": "Acenar",
        "texto": "Você escolheu: Acenar.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Focar",
        "texto": "Você escolheu: Focar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Dar camisa",
        "texto": "Você escolheu: Dar camisa.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_074",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 2,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Fã invade treino pedindo foto.",
    "escolhas": [
      {
        "id": "a",
        "label": "Tirar foto",
        "texto": "Você escolheu: Tirar foto.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Chamar segurança",
        "texto": "Você escolheu: Chamar segurança.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_075",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 3,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Boicote online após derrota.",
    "escolhas": [
      {
        "id": "a",
        "label": "Responder",
        "texto": "Você escolheu: Responder.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Silêncio",
        "texto": "Você escolheu: Silêncio.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Postar treino",
        "texto": "Você escolheu: Postar treino.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_076",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 1,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Criança entrega carta emocionante.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ler e agradecer",
        "texto": "Você escolheu: Ler e agradecer.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Doar ingresso",
        "texto": "Você escolheu: Doar ingresso.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Compartilhar",
        "texto": "Você escolheu: Compartilhar.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_077",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 2,
    "probabilidade": 0.35,
    "condicoes": {},
    "efeitos": {},
    "texto": "Torcedor xinga você no estacionamento.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ignorar",
        "texto": "Você escolheu: Ignorar.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Responder",
        "texto": "Você escolheu: Responder.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Reportar",
        "texto": "Você escolheu: Reportar.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_078",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 3,
    "probabilidade": 0.45,
    "condicoes": {},
    "efeitos": {},
    "texto": "Organizada pede visita a projeto social.",
    "escolhas": [
      {
        "id": "a",
        "label": "Ir",
        "texto": "Você escolheu: Ir.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Doar sem ir",
        "texto": "Você escolheu: Doar sem ir.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Recusar",
        "texto": "Você escolheu: Recusar.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_079",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 1,
    "probabilidade": 0.55,
    "condicoes": {},
    "efeitos": {},
    "texto": "Meme seu vira hit.",
    "escolhas": [
      {
        "id": "a",
        "label": "Rir junto",
        "texto": "Você escolheu: Rir junto.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Pedir remoção",
        "texto": "Você escolheu: Pedir remoção.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Monetizar",
        "texto": "Você escolheu: Monetizar.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  },
  {
    "id": "evt_torcedores_080",
    "categoria": "torcedores",
    "categoriaLabel": "Torcedores",
    "peso": 2,
    "probabilidade": 0.65,
    "condicoes": {},
    "efeitos": {},
    "texto": "Fãs fazem mosaico com seu número.",
    "escolhas": [
      {
        "id": "a",
        "label": "Agradecer público",
        "texto": "Você escolheu: Agradecer público.",
        "efeitos": {
          "popularidade": 10,
          "motivacao": 6,
          "energia": -2
        }
      },
      {
        "id": "b",
        "label": "Presentear líderes",
        "texto": "Você escolheu: Presentear líderes.",
        "efeitos": {
          "popularidade": 7,
          "motivacao": 4,
          "dinheiro": -500
        }
      },
      {
        "id": "c",
        "label": "Manter discreto",
        "texto": "Você escolheu: Manter discreto.",
        "efeitos": {
          "popularidade": 3,
          "motivacao": 2
        }
      }
    ]
  }
]

export const CAREER_EVENT_COUNT = CAREER_EVENTS.length

export const CAREER_EVENTS_BY_ID = Object.fromEntries(
  CAREER_EVENTS.map((e) => [e.id, e]),
)

