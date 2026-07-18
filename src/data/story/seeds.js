/**
 * Sementes narrativas — estruturas, não eventos fixos.
 * Texto final é composto na Engine com contexto vivo + flags.
 *
 * Cada seed: theme, roles, stages[], cada stage com choiceArchetypes.
 * Continuação: choice.continue → próximo stage | close | branch.
 */

export const STORY_SEEDS = [
  {
    id: 'seed_locker_tension',
    theme: 'companheiros',
    roles: ['teammate', 'coach'],
    titlePatterns: [
      'Choque no vestiário em {city}',
      '{teammate} cobra postura',
      'Fissura no elenco do {teamShort}',
    ],
    stages: [
      {
        contextPatterns: [
          'Após a semana em {city}, {teammate} confronta você na frente do grupo. A química do {teamShort} está em jogo.',
          'O clima com os companheiros ({teammatesRel}/100) pesa. {teammate} quer respostas sobre sua atitude.',
        ],
        descriptionPatterns: [
          'A tensão envolve personalidade ({temperamento} de temperamento), desempenho recente ({perfLabel}) e o olhar de {coach}.',
          'Companheiros observam. {coach} ainda não falou — mas vai falar.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Assumir a liderança', 'Chamar o grupo para alinhar'],
            tags: ['lead', 'loyal'],
            efeitos: { relCompanheiros: 4, motivacao: 2, energia: -3 },
            continue: 'next',
            flags: { lockerLeader: 1 },
          },
          {
            id: 'b',
            labels: ['Responder na mesma moeda', 'Elevar o tom'],
            tags: ['ego', 'temper'],
            efeitos: { relCompanheiros: -5, motivacao: 1, popularidade: 1 },
            continue: 'next',
            flags: { lockerFeud: 1 },
          },
          {
            id: 'c',
            labels: ['Pedir mediação do técnico', 'Levar a {coach}'],
            tags: ['coach', 'discipline'],
            efeitos: { relTreinador: 3, relCompanheiros: -1 },
            continue: 'next',
            flags: { coachMediator: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'A história do vestiário vaza. Em {city}, a imprensa pergunta se o {teamShort} está rachado.',
          'Semana seguinte: {teammate} ainda não esqueceu. Flags da escolha anterior moldam o clima.',
        ],
        descriptionPatterns: [
          'Popularidade ({popularidade}) e relação com a imprensa ({pressRel}) definem o tamanho do estrago.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Fazer as pazes em público', 'Publicar apoio ao elenco'],
            tags: ['loyal', 'media'],
            efeitos: { relCompanheiros: 5, popularidade: 2, dinheiro: -2000 },
            continue: 'next',
            flags: { publicPeace: 1, lockerFeud: -1 },
          },
          {
            id: 'b',
            labels: ['Ignorar e focar no jogo', 'Deixar o quadro falar'],
            tags: ['compete'],
            efeitos: { motivacao: 3, relCompanheiros: -2 },
            continue: 'next',
            flags: { silentTreatment: 1 },
          },
          {
            id: 'c',
            labels: ['Expor o conflito na mídia', 'Dar entrevista afiada'],
            tags: ['ego', 'media'],
            efeitos: { popularidade: 4, relCompanheiros: -6, relTreinador: -2 },
            continue: 'close',
            flags: { mediaBlowup: 1, lockerFeud: 2 },
          },
        ],
      },
      {
        contextPatterns: [
          'Desfecho no {teamShort}: a diretoria e {coach} cobram uma posição final.',
        ],
        descriptionPatterns: [
          'O que você decidir agora ecoa na liga e nas próximas histórias com estes personagens.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Reconstruir a confiança', 'Jantar com o elenco'],
            tags: ['loyal'],
            efeitos: { relCompanheiros: 6, felicidade: 3, dinheiro: -4000 },
            continue: 'close',
            flags: { lockerResolved: 1, lockerFeud: -2 },
          },
          {
            id: 'b',
            labels: ['Pedir troca de papéis', 'Cobrar minutos e status'],
            tags: ['ambition'],
            efeitos: { relTreinador: -3, motivacao: 4, popularidade: 2 },
            continue: 'close',
            flags: { roleDemand: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_coach_system',
    theme: 'treinador',
    roles: ['coach'],
    titlePatterns: [
      '{coach} muda o sistema',
      'Confronto tático com {coach}',
      'Rigor no comando do {teamShort}',
    ],
    stages: [
      {
        contextPatterns: [
          '{coach} quer alterar sua função. Relação atual: {coachRel}/100. Disciplina e ego entram em jogo.',
        ],
        descriptionPatterns: [
          'O sistema ofensivo do técnico esbarra na sua personalidade ({ambicao} ambição, {disciplina} disciplina).',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Aceitar o novo papel', 'Comprar o sistema'],
            tags: ['discipline', 'loyal'],
            efeitos: { relTreinador: 5, motivacao: -1, energia: -2 },
            continue: 'next',
            flags: { coachBuyIn: 1 },
          },
          {
            id: 'b',
            labels: ['Questionar na reunião', 'Pedir explicação pública'],
            tags: ['ego'],
            efeitos: { relTreinador: -4, popularidade: 2 },
            continue: 'next',
            flags: { coachClash: 1 },
          },
          {
            id: 'c',
            labels: ['Propor meio-termo', 'Negociar minutos'],
            tags: ['ambition', 'lead'],
            efeitos: { relTreinador: 1, motivacao: 2 },
            continue: 'next',
            flags: { coachNegotiate: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'O elenco percebe o clima com {coach}. Desempenho ({perfLabel}) vira argumento dos dois lados.',
        ],
        descriptionPatterns: [
          'Em {city}, torcida e mídia já especulam sobre o banco.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Provar no treino', 'Dobrar carga'],
            tags: ['discipline', 'compete'],
            efeitos: { energia: -6, motivacao: 4, relTreinador: 3 },
            continue: 'close',
            flags: { coachProve: 1, coachClash: -1 },
          },
          {
            id: 'b',
            labels: ['Buscar apoio da diretoria', 'Falar com o GM'],
            tags: ['ambition'],
            efeitos: { relTreinador: -5, dinheiro: 0, popularidade: 1 },
            continue: 'close',
            flags: { gmLobby: 1 },
            efeitosExtra: { gm: -2 },
          },
          {
            id: 'c',
            labels: ['Manter o confronto', 'Não ceder'],
            tags: ['temper', 'ego'],
            efeitos: { relTreinador: -7, motivacao: 2, felicidade: -3 },
            continue: 'close',
            flags: { coachColdWar: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_city_spotlight',
    theme: 'cidade',
    roles: ['sponsor'],
    titlePatterns: [
      '{city} quer um herói',
      'Holofotes em {city}',
      'A cidade cobra presença',
    ],
    stages: [
      {
        contextPatterns: [
          'Atores locais, escolas e a prefeitura de {city} pedem sua presença. Popularidade: {popularidade}/100.',
        ],
        descriptionPatterns: [
          'Patrocínios ({sponsorCount}) e a marca do {teamShort} ganham ou perdem com a resposta.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Abraçar a cidade', 'Aceitar a agenda comunitária'],
            tags: ['loyal', 'media'],
            efeitos: { popularidade: 5, energia: -4, felicidade: 2, dinheiro: 3000 },
            continue: 'next',
            flags: { cityHero: 1 },
          },
          {
            id: 'b',
            labels: ['Só treino e jogo', 'Recusar eventos extras'],
            tags: ['discipline', 'compete'],
            efeitos: { popularidade: -3, motivacao: 2, energia: 3 },
            continue: 'next',
            flags: { cityDistant: 1 },
          },
          {
            id: 'c',
            labels: ['Monetizar a presença', 'Cobrar cache alto'],
            tags: ['ambition', 'ego'],
            efeitos: { dinheiro: 12000, popularidade: -1, felicidade: -1 },
            continue: 'next',
            flags: { cityPaid: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'Semanas depois, {city} reage à sua postura. A liga observa a narrativa do jogador do {teamShort}.',
        ],
        descriptionPatterns: [
          'Torcida ({fansRel}/100) e imprensa ({pressRel}/100) já formaram opinião.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Dobrar a aposta local', 'Virar rosto da cidade'],
            tags: ['media', 'loyal'],
            efeitos: { popularidade: 6, dinheiro: 8000, energia: -3 },
            continue: 'close',
            flags: { cityIcon: 1 },
          },
          {
            id: 'b',
            labels: ['Recuar e focar na temporada', 'Silêncio estratégico'],
            tags: ['discipline'],
            efeitos: { motivacao: 3, popularidade: -2 },
            continue: 'close',
            flags: { cityFade: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_sponsor_crossroads',
    theme: 'patrocinios',
    roles: ['sponsor'],
    titlePatterns: [
      'Patrocinador aperta o cerco',
      'Contrato de imagem em jogo',
      '{sponsor} exige retorno',
    ],
    stages: [
      {
        contextPatterns: [
          '{sponsor} quer mais exposições. Relação com patrocínios: {sponsorsRel}/100. Você tem {sponsorCount} acordo(s).',
        ],
        descriptionPatterns: [
          'Desempenho ({perfLabel}) e popularidade ({popularidade}) definem o poder de barganha.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Cumprir tudo', 'Virar prioridade da marca'],
            tags: ['discipline'],
            efeitos: { dinheiro: 10000, energia: -5, motivacao: -1, popularidade: 2 },
            continue: 'next',
            flags: { sponsorLoyal: 1 },
            efeitosExtra: { sponsors: 4 },
          },
          {
            id: 'b',
            labels: ['Renegociar cláusulas', 'Pedir mais dinheiro'],
            tags: ['ambition'],
            efeitos: { dinheiro: 18000, popularidade: 1 },
            continue: 'next',
            flags: { sponsorRenegotiate: 1 },
            efeitosExtra: { sponsors: -2 },
          },
          {
            id: 'c',
            labels: ['Enfriar a marca', 'Priorizar o basquete'],
            tags: ['compete'],
            efeitos: { motivacao: 3, dinheiro: -5000, popularidade: -2 },
            continue: 'close',
            flags: { sponsorCold: 1 },
            efeitosExtra: { sponsors: -5 },
          },
        ],
      },
      {
        contextPatterns: [
          '{sponsor} responde à sua postura. Outras marcas em {city} prestam atenção.',
        ],
        descriptionPatterns: [
          'A decisão anterior ainda ecoa nas flags de patrocínio.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Fechar campanha nacional', 'Aceitar tour'],
            tags: ['media', 'ambition'],
            efeitos: { dinheiro: 25000, popularidade: 5, energia: -6 },
            continue: 'close',
            flags: { sponsorCampaign: 1 },
            efeitosExtra: { sponsors: 5, press: 2 },
          },
          {
            id: 'b',
            labels: ['Manter distância', 'Limitar aparições'],
            tags: ['discipline'],
            efeitos: { motivacao: 2, dinheiro: 2000 },
            continue: 'close',
            flags: { sponsorBalanced: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_performance_heat',
    theme: 'desempenho',
    roles: ['coach', 'teammate'],
    titlePatterns: [
      'A liga julga seu momento',
      'Desempenho sob o microscópio',
      'Semana quente no {teamShort}',
    ],
    stages: [
      {
        contextPatterns: [
          'Números recentes ({perfLabel}) colocam você no centro da narrativa da liga. OVR {overall}.',
        ],
        descriptionPatterns: [
          '{coach} e {teammate} reagem de formas diferentes. A conferência {conference} não perdoa.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Abraçar a pressão', 'Pedir a bola'],
            tags: ['compete', 'ego'],
            efeitos: { motivacao: 4, energia: -3, popularidade: 2 },
            continue: 'next',
            flags: { volumeShooter: 1 },
          },
          {
            id: 'b',
            labels: ['Jogar para o time', 'Baixar o uso'],
            tags: ['loyal', 'lead'],
            efeitos: { relCompanheiros: 4, motivacao: 1, popularidade: -1 },
            continue: 'next',
            flags: { teamFirst: 1 },
          },
          {
            id: 'c',
            labels: ['Culpar o sistema', 'Cobrar {coach}'],
            tags: ['temper'],
            efeitos: { relTreinador: -5, motivacao: 2 },
            continue: 'next',
            flags: { blameCoach: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'A resposta da liga chega: rivais, mídia e o próprio {teamShort} ajustam o discurso.',
        ],
        descriptionPatterns: [
          'Flags de desempenho abrem ou fecham portas nas próximas cadeias.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Sustentar o nível', 'Dobrar foco'],
            tags: ['compete', 'discipline'],
            efeitos: { motivacao: 5, energia: -4, felicidade: 2 },
            continue: 'close',
            flags: { clutchReputation: 1 },
          },
          {
            id: 'b',
            labels: ['Pedir ajuda do elenco', 'Reunião com {teammate}'],
            tags: ['loyal'],
            efeitos: { relCompanheiros: 5, motivacao: 2 },
            continue: 'close',
            flags: { peerSupport: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_media_persona',
    theme: 'popularidade',
    roles: ['sponsor'],
    titlePatterns: [
      'A mídia escreve sua persona',
      'Narrativa nacional',
      'Você virou assunto na liga',
    ],
    stages: [
      {
        contextPatterns: [
          'Com {popularidade} de popularidade e imprensa em {pressRel}/100, surge um ângulo: herói, vilão ou enigma.',
        ],
        descriptionPatterns: [
          'Ego ({ego}) e temperamento ({temperamento}) influenciam o tom das perguntas em {city}.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Persona acessível', 'Abrir o jogo'],
            tags: ['media', 'loyal'],
            efeitos: { popularidade: 4, felicidade: 2 },
            continue: 'next',
            flags: { mediaFriendly: 1 },
            efeitosExtra: { press: 4, fans: 3 },
          },
          {
            id: 'b',
            labels: ['Persona fria', 'Respostas curtas'],
            tags: ['discipline'],
            efeitos: { popularidade: -1, motivacao: 2, relTreinador: 1 },
            continue: 'next',
            flags: { mediaCold: 1 },
            efeitosExtra: { press: -2 },
          },
          {
            id: 'c',
            labels: ['Persona polêmica', 'Gerar manchete'],
            tags: ['ego', 'temper'],
            efeitos: { popularidade: 6, relCompanheiros: -3, felicidade: -2 },
            continue: 'next',
            flags: { mediaVillain: 1 },
            efeitosExtra: { press: 5, fans: 2 },
          },
        ],
      },
      {
        contextPatterns: [
          'A persona escolhida cola. Patrocinadores e a liga reagem na segunda onda.',
        ],
        descriptionPatterns: [
          'O que você plantou na mídia agora tem consequência concreta.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Suavizar o discurso', 'Correção de rota'],
            tags: ['loyal', 'media'],
            efeitos: { popularidade: 2, felicidade: 3, dinheiro: 5000 },
            continue: 'close',
            flags: { mediaSoftReset: 1, mediaVillain: -1 },
          },
          {
            id: 'b',
            labels: ['Dobrar a narrativa', 'Alimentar o hype'],
            tags: ['ego', 'ambition'],
            efeitos: { popularidade: 5, dinheiro: 15000, energia: -2 },
            continue: 'close',
            flags: { mediaBrand: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_league_stage',
    theme: 'liga',
    roles: ['coach'],
    titlePatterns: [
      'A liga testa seu nome',
      'Semana de declaração nacional',
      'Holofote da conferência {conference}',
    ],
    stages: [
      {
        contextPatterns: [
          'Rivais da {conference} e analistas da liga colocam o {teamShort} — e você — no centro do debate.',
        ],
        descriptionPatterns: [
          'Desempenho ({perfLabel}), popularidade ({popularidade}) e relação com {coach} alimentam o script.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Declarar meta alta', 'Prometer título'],
            tags: ['ambition', 'ego'],
            efeitos: { popularidade: 3, motivacao: 3, relCompanheiros: -1 },
            continue: 'next',
            flags: { titlePromise: 1 },
          },
          {
            id: 'b',
            labels: ['Discurso coletivo', 'Elevar o elenco'],
            tags: ['loyal', 'lead'],
            efeitos: { relCompanheiros: 4, popularidade: 2 },
            continue: 'next',
            flags: { teamNarrative: 1 },
          },
          {
            id: 'c',
            labels: ['Evitar holofote', 'Foco silencioso'],
            tags: ['discipline'],
            efeitos: { motivacao: 2, popularidade: -2, energia: 2 },
            continue: 'close',
            flags: { lowProfile: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'A liga não esquece declarações. Semana {week}, temporada {season}: a cobrança chega.',
        ],
        descriptionPatterns: [
          'Sua promessa (ou silêncio) vira contexto para o próximo capítulo.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Reafirmar a meta', 'Não recuar'],
            tags: ['ambition', 'compete'],
            efeitos: { motivacao: 5, energia: -3, popularidade: 2 },
            continue: 'close',
            flags: { titlePromise: 2 },
          },
          {
            id: 'b',
            labels: ['Dividir o peso', 'Creditar o time'],
            tags: ['loyal'],
            efeitos: { relCompanheiros: 5, relTreinador: 2, felicidade: 2 },
            continue: 'close',
            flags: { sharedBurden: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_personality_mirror',
    theme: 'personalidade',
    roles: ['teammate'],
    titlePatterns: [
      'Espelho no vestiário',
      'Quem você é fora da quadra',
      'Personalidade em xeque',
    ],
    stages: [
      {
        contextPatterns: [
          '{teammate} diz que sua reputação interna não bate com a externa. Lealdade {lealdade}, ego {ego}.',
        ],
        descriptionPatterns: [
          'Não é um evento solto — é um fio que a Story Engine pode puxar de novo conforme suas flags.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Aceitar o feedback', 'Pedir exemplos'],
            tags: ['loyal', 'discipline'],
            efeitos: { relCompanheiros: 3, felicidade: 1, motivacao: 1 },
            continue: 'next',
            flags: { selfAware: 1 },
          },
          {
            id: 'b',
            labels: ['Rejeitar a leitura', 'Defender seu estilo'],
            tags: ['ego', 'temper'],
            efeitos: { relCompanheiros: -3, motivacao: 2, popularidade: 1 },
            continue: 'next',
            flags: { defiantPersona: 1 },
          },
          {
            id: 'c',
            labels: ['Transformar em marca', 'Usar a crítica'],
            tags: ['ambition', 'media'],
            efeitos: { popularidade: 3, dinheiro: 7000, felicidade: -1 },
            continue: 'close',
            flags: { brandPersona: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'A conversa com {teammate} volta na forma de atitude em {city}.',
        ],
        descriptionPatterns: [
          'Cadeia de personalidade: a escolha anterior altera o tom deste capítulo.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Mostrar mudança', 'Ações, não palavras'],
            tags: ['loyal', 'discipline'],
            efeitos: { relCompanheiros: 5, relTreinador: 2, motivacao: 2 },
            continue: 'close',
            flags: { selfAware: 2 },
          },
          {
            id: 'b',
            labels: ['Manter a persona', 'Sem desculpas'],
            tags: ['ego'],
            efeitos: { popularidade: 3, relCompanheiros: -2 },
            continue: 'close',
            flags: { defiantPersona: 2 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_relationship_web',
    theme: 'relacionamentos',
    roles: ['coach', 'teammate'],
    titlePatterns: [
      'Teia de relações',
      'Alianças no {teamShort}',
      'Quem está com você?',
    ],
    stages: [
      {
        contextPatterns: [
          'Coach {coachRel}/100 · Companheiros {teammatesRel}/100 · Torcida {fansRel}/100 · Imprensa {pressRel}/100.',
        ],
        descriptionPatterns: [
          'Uma escolha força priorizar um vínculo — e enfraquecer outro. A memória narrativa registra.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Fidelidade ao técnico', 'Alinhar com {coach}'],
            tags: ['coach', 'discipline'],
            efeitos: { relTreinador: 6, relCompanheiros: -2 },
            continue: 'next',
            flags: { allyCoach: 1 },
          },
          {
            id: 'b',
            labels: ['Fidelidade ao elenco', 'Proteger {teammate}'],
            tags: ['loyal'],
            efeitos: { relCompanheiros: 6, relTreinador: -2 },
            continue: 'next',
            flags: { allyTeammates: 1 },
          },
          {
            id: 'c',
            labels: ['Jogar para a torcida', 'Gestos à cidade'],
            tags: ['media'],
            efeitos: { popularidade: 5, relTreinador: -1, relCompanheiros: -1 },
            continue: 'next',
            flags: { allyFans: 1 },
            efeitosExtra: { fans: 5, press: 2 },
          },
        ],
      },
      {
        contextPatterns: [
          'Sua aliança anterior gera reação. Em {city}, lados cobram coerência.',
        ],
        descriptionPatterns: [
          'Continuação direta da teia — não é um evento isolado.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Reafirmar a aliança', 'Não mudar de lado'],
            tags: ['loyal'],
            efeitos: { motivacao: 3, felicidade: 2 },
            continue: 'close',
            flags: { allianceFirm: 1 },
          },
          {
            id: 'b',
            labels: ['Reequilibrar vínculos', 'Pedir trégua geral'],
            tags: ['lead'],
            efeitos: { relTreinador: 3, relCompanheiros: 3, energia: -2 },
            continue: 'close',
            flags: { allianceBalance: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_team_identity',
    theme: 'time',
    roles: ['coach', 'teammate'],
    titlePatterns: [
      'Identidade do {teamShort}',
      'O que este time é?',
      'Projeto em {city}',
    ],
    stages: [
      {
        contextPatterns: [
          'O {teamName} debate identidade: young core, win-now ou marca de {city}.',
        ],
        descriptionPatterns: [
          'Você é peça central. Ambição ({ambicao}) e lealdade ({lealdade}) pesam na escolha.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Win-now', 'Pressionar por peças'],
            tags: ['ambition', 'compete'],
            efeitos: { motivacao: 3, relTreinador: 1, popularidade: 2 },
            continue: 'next',
            flags: { winNow: 1 },
            efeitosExtra: { gm: -1 },
          },
          {
            id: 'b',
            labels: ['Crescer junto', 'Projeto de longo prazo'],
            tags: ['loyal', 'discipline'],
            efeitos: { relCompanheiros: 4, felicidade: 2 },
            continue: 'next',
            flags: { longTerm: 1 },
          },
          {
            id: 'c',
            labels: ['Marca pessoal acima do time', 'Priorizar highlight'],
            tags: ['ego', 'media'],
            efeitos: { popularidade: 4, relCompanheiros: -4, dinheiro: 5000 },
            continue: 'next',
            flags: { personalBrand: 1 },
          },
        ],
      },
      {
        contextPatterns: [
          'A diretoria do {teamShort} reage à identidade que você empurrou.',
        ],
        descriptionPatterns: [
          'Cadeia de time: consequências na liga e no vestiário.',
        ],
        choices: [
          {
            id: 'a',
            labels: ['Assumir o projeto', 'Ser a cara do {teamShort}'],
            tags: ['lead', 'loyal'],
            efeitos: { popularidade: 3, motivacao: 3, relCompanheiros: 2 },
            continue: 'close',
            flags: { franchiseFace: 1 },
          },
          {
            id: 'b',
            labels: ['Manter distância emocional', 'Contrato é negócio'],
            tags: ['ambition'],
            efeitos: { dinheiro: 8000, felicidade: -2, relCompanheiros: -1 },
            continue: 'close',
            flags: { mercenaryTone: 1 },
          },
        ],
      },
    ],
  },
]

export const STORY_SEEDS_BY_ID = Object.fromEntries(
  STORY_SEEDS.map((s) => [s.id, s]),
)
