/**
 * Catálogo de conquistas — gerado a partir de tiers (200+).
 * Cada conquista: id, nome, descrição, categoria, recompensa, target/metric.
 */

import { ACHIEVEMENT_CATEGORIES } from './constants'

const catalog = []

function add(def) {
  catalog.push({
    id: def.id,
    name: def.name,
    description: def.description,
    category: def.category,
    categoryLabel: ACHIEVEMENT_CATEGORIES[def.category]?.label ?? def.category,
    reward: def.reward ?? {},
    target: def.target ?? 1,
    metric: def.metric,
    hidden: Boolean(def.hidden),
  })
}

function tierReward(base, i) {
  const mult = 1 + i * 0.35
  return {
    dinheiro: Math.round((base.dinheiro ?? 0) * mult),
    xp: Math.round((base.xp ?? 0) * mult),
    popularidade: Math.round((base.popularidade ?? 0) * (1 + i * 0.15)),
    motivacao: base.motivacao ?? 0,
    felicidade: base.felicidade ?? 0,
  }
}

function stripZero(reward) {
  const out = {}
  for (const [k, v] of Object.entries(reward)) {
    if (v) out[k] = v
  }
  return out
}

// ─── Carreira ───────────────────────────────────────────────
const weekTiers = [1, 3, 5, 10, 15, 20, 30, 40, 50, 75, 100, 125, 150]
weekTiers.forEach((n, i) => {
  add({
    id: `car_weeks_${n}`,
    name: n === 1 ? 'Primeira semana' : `${n} semanas de carreira`,
    description: `Complete ${n} semana(s) na carreira.`,
    category: 'carreira',
    metric: 'weeksPlayed',
    target: n,
    reward: stripZero(tierReward({ dinheiro: 2000, xp: 25, motivacao: 1 }, i)),
  })
})

const levelTiers = [2, 3, 5, 7, 10, 12, 15, 18, 20, 25]
levelTiers.forEach((n, i) => {
  add({
    id: `car_level_${n}`,
    name: `Nível ${n}`,
    description: `Alcance o nível ${n} de progressão.`,
    category: 'carreira',
    metric: 'level',
    target: n,
    reward: stripZero(tierReward({ xp: 40, dinheiro: 3000, motivacao: 2 }, i)),
  })
})

const ovrTiers = [68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95]
ovrTiers.forEach((n, i) => {
  add({
    id: `car_ovr_${n}`,
    name: `Overall ${n}`,
    description: `Atinja overall ${n} (pico de carreira).`,
    category: 'carreira',
    metric: 'peakOverall',
    target: n,
    reward: stripZero(tierReward({ xp: 50, popularidade: 2, dinheiro: 4000 }, i)),
  })
})

const popTiers = [40, 50, 60, 70, 80, 90, 95, 100]
popTiers.forEach((n, i) => {
  add({
    id: `car_pop_${n}`,
    name: n >= 90 ? `Ícone (${n})` : `Popularidade ${n}`,
    description: `Alcance ${n} de popularidade (pico).`,
    category: 'carreira',
    metric: 'peakPopularidade',
    target: n,
    reward: stripZero(tierReward({ popularidade: 1, dinheiro: 5000, xp: 30 }, i)),
  })
})

const eventTiers = [1, 3, 5, 10, 15, 25, 40, 60]
eventTiers.forEach((n, i) => {
  add({
    id: `car_stories_${n}`,
    name: n === 1 ? 'Primeira história' : `${n} histórias resolvidas`,
    description: `Resolva ${n} história(s) da Story Engine.`,
    category: 'carreira',
    metric: 'storiesResolved',
    target: n,
    reward: stripZero(tierReward({ xp: 35, felicidade: 1, dinheiro: 2500 }, i)),
  })
})

;[5, 10, 20, 40].forEach((n, i) => {
  add({
    id: `car_train_${n}`,
    name: `${n} treinos`,
    description: `Complete ${n} semanas de treino.`,
    category: 'carreira',
    metric: 'trainingWeeks',
    target: n,
    reward: stripZero(tierReward({ xp: 40, motivacao: 2 }, i)),
  })
})

;[5, 15, 30].forEach((n, i) => {
  add({
    id: `car_rest_${n}`,
    name: `${n} descansos`,
    description: `Descanse ${n} semanas.`,
    category: 'carreira',
    metric: 'restWeeks',
    target: n,
    reward: stripZero(tierReward({ motivacao: 1, felicidade: 2 }, i)),
  })
})

;[3, 8, 15].forEach((n, i) => {
  add({
    id: `car_media_${n}`,
    name: `${n} semanas de mídia`,
    description: `Faça ${n} atividades de mídia.`,
    category: 'carreira',
    metric: 'mediaWeeks',
    target: n,
    reward: stripZero(tierReward({ popularidade: 2, dinheiro: 3000 }, i)),
  })
})

add({
  id: 'car_season_2',
  name: 'Veterano',
  description: 'Alcance a 2ª temporada.',
  category: 'carreira',
  metric: 'currentSeason',
  target: 2,
  reward: { dinheiro: 15000, xp: 100, popularidade: 3 },
})
add({
  id: 'car_season_3',
  name: 'Três temporadas',
  description: 'Alcance a 3ª temporada.',
  category: 'carreira',
  metric: 'currentSeason',
  target: 3,
  reward: { dinheiro: 25000, xp: 150, popularidade: 4 },
})
add({
  id: 'car_season_5',
  name: 'Era completa',
  description: 'Alcance a 5ª temporada.',
  category: 'carreira',
  metric: 'currentSeason',
  target: 5,
  reward: { dinheiro: 50000, xp: 250, popularidade: 5 },
})

// ─── Temporada ──────────────────────────────────────────────
const seasonWinTiers = [1, 3, 5, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50]
seasonWinTiers.forEach((n, i) => {
  add({
    id: `sea_wins_${n}`,
    name: n === 1 ? 'Primeira vitória' : `${n} vitórias na temporada`,
    description: `Vença ${n} jogo(s) com seu time na temporada atual.`,
    category: 'temporada',
    metric: 'seasonWins',
    target: n,
    reward: stripZero(tierReward({ xp: 30, motivacao: 1, dinheiro: 2000 }, i)),
  })
})

;[5, 10, 20, 40, 60, 82].forEach((n, i) => {
  add({
    id: `sea_games_${n}`,
    name: `${n} jogos na temporada`,
    description: `Seu time dispute ${n} jogos na temporada.`,
    category: 'temporada',
    metric: 'seasonGames',
    target: n,
    reward: stripZero(tierReward({ xp: 20, dinheiro: 1500 }, i)),
  })
})

add({
  id: 'sea_roll_1',
  name: 'Temporada completa',
  description: 'Arquive ao menos 1 temporada no History Engine.',
  category: 'temporada',
  metric: 'seasonsArchived',
  target: 1,
  reward: { dinheiro: 20000, xp: 120, popularidade: 3 },
})
add({
  id: 'sea_roll_3',
  name: 'Três arquivos',
  description: 'Arquive 3 temporadas.',
  category: 'temporada',
  metric: 'seasonsArchived',
  target: 3,
  reward: { dinheiro: 40000, xp: 200, popularidade: 4 },
})
add({
  id: 'sea_win_pct_60',
  name: 'Acima de .600',
  description: 'Tenha aproveitamento ≥ 60% com pelo menos 10 jogos.',
  category: 'temporada',
  metric: 'seasonWinPct60',
  target: 1,
  reward: { motivacao: 4, xp: 80, popularidade: 2 },
})
add({
  id: 'sea_win_pct_75',
  name: 'Elite (.750)',
  description: 'Tenha aproveitamento ≥ 75% com pelo menos 12 jogos.',
  category: 'temporada',
  metric: 'seasonWinPct75',
  target: 1,
  reward: { motivacao: 5, xp: 120, popularidade: 4 },
})
add({
  id: 'sea_streak_3',
  name: 'Três seguidas',
  description: 'Alcance sequência de 3 vitórias.',
  category: 'temporada',
  metric: 'winStreak',
  target: 3,
  reward: { motivacao: 3, xp: 40 },
})
add({
  id: 'sea_streak_5',
  name: 'Cinco seguidas',
  description: 'Alcance sequência de 5 vitórias.',
  category: 'temporada',
  metric: 'winStreak',
  target: 5,
  reward: { motivacao: 4, xp: 70, popularidade: 2 },
})
add({
  id: 'sea_streak_8',
  name: 'Oito seguidas',
  description: 'Alcance sequência de 8 vitórias.',
  category: 'temporada',
  metric: 'winStreak',
  target: 8,
  reward: { motivacao: 5, xp: 100, popularidade: 3 },
})

// ─── Partida ────────────────────────────────────────────────
const ptsGame = [10, 15, 20, 25, 30, 35, 40, 45, 50]
ptsGame.forEach((n, i) => {
  add({
    id: `mat_pts_${n}`,
    name: n >= 40 ? `${n} pontos em um jogo` : `${n}+ pontos`,
    description: `Marque pelo menos ${n} pontos em uma partida (box score).`,
    category: 'partida',
    metric: 'bestGamePoints',
    target: n,
    reward: stripZero(tierReward({ xp: 35, popularidade: 1, dinheiro: 2500 }, i)),
  })
})

;[5, 8, 10, 12, 15].forEach((n, i) => {
  add({
    id: `mat_ast_${n}`,
    name: `${n} assistências`,
    description: `Registre ${n} assistências em um jogo.`,
    category: 'partida',
    metric: 'bestGameAssists',
    target: n,
    reward: stripZero(tierReward({ xp: 30, relCompanheiros: 1 }, i)),
  })
})

;[8, 10, 12, 15, 18].forEach((n, i) => {
  add({
    id: `mat_reb_${n}`,
    name: `${n} rebotes`,
    description: `Pegue ${n} rebotes em um jogo.`,
    category: 'partida',
    metric: 'bestGameRebounds',
    target: n,
    reward: stripZero(tierReward({ xp: 30, motivacao: 1 }, i)),
  })
})

;[1, 3, 5, 10, 15, 25].forEach((n, i) => {
  add({
    id: `mat_mvp_${n}`,
    name: n === 1 ? 'MVP do jogo' : `${n} MVPs de jogo`,
    description: `Seja MVP de ${n} partida(s).`,
    category: 'partida',
    metric: 'gameMvps',
    target: n,
    reward: stripZero(tierReward({ xp: 45, popularidade: 2, dinheiro: 4000 }, i)),
  })
})

;[1, 3, 5, 8].forEach((n, i) => {
  add({
    id: `mat_td_${n}`,
    name: n === 1 ? 'Triple-double' : `${n} triple-doubles`,
    description: `Feche ${n} triple-double(s) na carreira.`,
    category: 'partida',
    metric: 'tripleDoubles',
    target: n,
    reward: stripZero(tierReward({ xp: 80, popularidade: 3, dinheiro: 8000 }, i)),
  })
})

add({
  id: 'mat_steal_5',
  name: 'Mão leve',
  description: 'Registre 5 roubos em um jogo.',
  category: 'partida',
  metric: 'bestGameSteals',
  target: 5,
  reward: { xp: 50, motivacao: 2 },
})
add({
  id: 'mat_block_5',
  name: 'Protetor do aro',
  description: 'Registre 5 tocos em um jogo.',
  category: 'partida',
  metric: 'bestGameBlocks',
  target: 5,
  reward: { xp: 50, motivacao: 2 },
})
add({
  id: 'mat_blowout_20',
  name: 'Passeio (+20)',
  description: 'Vença um jogo por 20+ pontos com seu time.',
  category: 'partida',
  metric: 'bestMarginWin',
  target: 20,
  reward: { xp: 40, motivacao: 2, popularidade: 1 },
})
add({
  id: 'mat_blowout_30',
  name: 'Massacre (+30)',
  description: 'Vença um jogo por 30+ pontos com seu time.',
  category: 'partida',
  metric: 'bestMarginWin',
  target: 30,
  reward: { xp: 70, motivacao: 3, popularidade: 2 },
})

// ─── Financeiro ─────────────────────────────────────────────
const moneyTiers = [
  10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000,
]
moneyTiers.forEach((n, i) => {
  add({
    id: `fin_cash_${n}`,
    name: n >= 1000000 ? `Milionário ($${(n / 1e6).toFixed(0)}M)` : `Caixa $${(n / 1000).toFixed(0)}k`,
    description: `Acumule $${n.toLocaleString('en-US')} em dinheiro.`,
    category: 'financeiro',
    metric: 'dinheiro',
    target: n,
    reward: stripZero(tierReward({ felicidade: 2, xp: 40 }, i)),
  })
})

const patTiers = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000]
patTiers.forEach((n, i) => {
  add({
    id: `fin_pat_${n}`,
    name: `Patrimônio $${n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1000).toFixed(0)}k`}`,
    description: `Alcance patrimônio de $${n.toLocaleString('en-US')}.`,
    category: 'financeiro',
    metric: 'peakPatrimonio',
    target: n,
    reward: stripZero(tierReward({ felicidade: 3, xp: 50, popularidade: 1 }, i)),
  })
})

;[1, 2, 3, 5].forEach((n, i) => {
  add({
    id: `fin_sponsors_${n}`,
    name: n === 1 ? 'Primeiro patrocínio' : `${n} patrocínios ativos`,
    description: `Tenha ${n} patrocínio(s) ativo(s) ao mesmo tempo.`,
    category: 'financeiro',
    metric: 'activeSponsors',
    target: n,
    reward: stripZero(tierReward({ dinheiro: 8000, popularidade: 2, xp: 40 }, i)),
  })
})

;[25000, 100000, 250000, 500000].forEach((n, i) => {
  add({
    id: `fin_salary_${n}`,
    name: `Salários: $${(n / 1000).toFixed(0)}k`,
    description: `Acumule $${n.toLocaleString('en-US')} em salários recebidos.`,
    category: 'financeiro',
    metric: 'totalSalaryEarned',
    target: n,
    reward: stripZero(tierReward({ xp: 45, felicidade: 1 }, i)),
  })
})

;[10000, 50000, 150000, 300000].forEach((n, i) => {
  add({
    id: `fin_sponsor_earn_${n}`,
    name: `Marcas: $${(n / 1000).toFixed(0)}k`,
    description: `Acumule $${n.toLocaleString('en-US')} em patrocínios.`,
    category: 'financeiro',
    metric: 'totalSponsorEarned',
    target: n,
    reward: stripZero(tierReward({ popularidade: 2, xp: 40 }, i)),
  })
})

;[1, 2, 3].forEach((n, i) => {
  add({
    id: `fin_luxury_${n}`,
    name: `Estilo de vida ${n}`,
    description: `Alcance nível de luxo ${n}.`,
    category: 'financeiro',
    metric: 'luxuryLevel',
    target: n,
    reward: stripZero(tierReward({ felicidade: 3, popularidade: 1 }, i)),
  })
})

// ─── Relacionamentos ────────────────────────────────────────
const relKeys = [
  ['coach', 'Treinador', 'coachRel'],
  ['teammates', 'Companheiros', 'teammatesRel'],
  ['fans', 'Torcida', 'fansRel'],
  ['press', 'Imprensa', 'pressRel'],
  ['sponsors', 'Patrocinadores', 'sponsorsRel'],
  ['gm', 'GM', 'gmRel'],
  ['agent', 'Agente', 'agentRel'],
]
const relTiers = [40, 55, 70, 85, 95]
for (const [key, label, metric] of relKeys) {
  relTiers.forEach((n, i) => {
    add({
      id: `rel_${key}_${n}`,
      name: `${label} ${n}`,
      description: `Alcance ${n} de relação com ${label.toLowerCase()}.`,
      category: 'relacionamentos',
      metric,
      target: n,
      reward: stripZero(
        tierReward(
          {
            xp: 25,
            felicidade: key === 'teammates' || key === 'coach' ? 2 : 1,
            popularidade: key === 'fans' || key === 'press' ? 2 : 0,
          },
          i,
        ),
      ),
    })
  })
}

add({
  id: 'rel_all_70',
  name: 'Diplomata',
  description: 'Tenha todas as relações principais ≥ 70.',
  category: 'relacionamentos',
  metric: 'allRels70',
  target: 1,
  reward: { felicidade: 5, xp: 100, popularidade: 3 },
})
add({
  id: 'rel_chem_pairs_10',
  name: 'Química crescente',
  description: 'Mantenha 10+ pares de química registrados no elenco.',
  category: 'relacionamentos',
  metric: 'chemistryPairs',
  target: 10,
  reward: { relCompanheiros: 3, xp: 50 },
})

// ─── Títulos ────────────────────────────────────────────────
;[1, 2, 3, 5].forEach((n, i) => {
  add({
    id: `tit_champ_${n}`,
    name: n === 1 ? 'Campeão' : `${n} títulos`,
    description: `Seu time conquiste ${n} campeonato(s) (arquivo).`,
    category: 'titulos',
    metric: 'championships',
    target: n,
    reward: stripZero(tierReward({ dinheiro: 50000, xp: 200, popularidade: 5 }, i)),
  })
})

;[1, 2, 3, 5].forEach((n, i) => {
  add({
    id: `tit_mvp_${n}`,
    name: n === 1 ? 'MVP da temporada' : `${n} MVPs`,
    description: `Registre ${n} MVP(s) de temporada no arquivo.`,
    category: 'titulos',
    metric: 'seasonMvps',
    target: n,
    reward: stripZero(tierReward({ dinheiro: 40000, xp: 180, popularidade: 5 }, i)),
  })
})

;[1, 3, 5, 10].forEach((n, i) => {
  add({
    id: `tit_awards_${n}`,
    name: n === 1 ? 'Primeiro prêmio' : `${n} premiações`,
    description: `Acumule ${n} premiação(ões) no History Engine.`,
    category: 'titulos',
    metric: 'awardsCount',
    target: n,
    reward: stripZero(tierReward({ xp: 60, popularidade: 2, dinheiro: 10000 }, i)),
  })
})

add({
  id: 'tit_hof_ballot',
  name: 'Nome na urna',
  description: 'Tenha ao menos uma votação no Hall da Fama registrada.',
  category: 'titulos',
  metric: 'hofBallots',
  target: 1,
  reward: { xp: 150, popularidade: 5, dinheiro: 30000 },
})
add({
  id: 'tit_hof_induct',
  name: 'Hall da Fama',
  description: 'Induza alguém (ou você) ao Hall da Fama.',
  category: 'titulos',
  metric: 'hofInductees',
  target: 1,
  reward: { xp: 250, popularidade: 8, dinheiro: 75000, felicidade: 5 },
})
add({
  id: 'tit_hof_3',
  name: 'Classe do Hall',
  description: 'Tenha 3 induzidos no Hall da Fama.',
  category: 'titulos',
  metric: 'hofInductees',
  target: 3,
  reward: { xp: 300, popularidade: 6, dinheiro: 50000 },
})
add({
  id: 'tit_finals_mvp',
  name: 'Finals MVP',
  description: 'Registre um prêmio de Finals MVP no arquivo.',
  category: 'titulos',
  metric: 'finalsMvps',
  target: 1,
  reward: { dinheiro: 60000, xp: 220, popularidade: 6 },
})
add({
  id: 'tit_dpoy',
  name: 'DPOY',
  description: 'Registre um DPOY no arquivo.',
  category: 'titulos',
  metric: 'dpoyCount',
  target: 1,
  reward: { dinheiro: 40000, xp: 180, popularidade: 4 },
})

// Dynasty Engine
add({
  id: 'tit_dynasty_rising',
  name: 'Era emergente',
  description: 'O History Engine reconhece uma dinastia emergente na liga.',
  category: 'titulos',
  metric: 'dynastiesRecognized',
  target: 1,
  reward: { xp: 200, popularidade: 5, dinheiro: 40000, felicidade: 2 },
})
add({
  id: 'tit_dynasty_active',
  name: 'Vestindo a dinastia',
  description: 'Jogue em uma franquia classificada como dinastia ativa.',
  category: 'titulos',
  metric: 'dynastyActive',
  target: 1,
  reward: { xp: 220, popularidade: 6, motivacao: 3, dinheiro: 50000 },
})
add({
  id: 'tit_dynasty_full',
  name: 'Dinastia completa',
  description: 'Esteja em uma franquia no tier Dinastia (não só emergente).',
  category: 'titulos',
  metric: 'dynastyTierRank',
  target: 2,
  reward: { xp: 280, popularidade: 8, dinheiro: 80000, felicidade: 4 },
})
add({
  id: 'tit_dynasty_super',
  name: 'Super dinastia',
  description: 'Esteja em uma franquia no tier Super dinastia.',
  category: 'titulos',
  metric: 'dynastyTierRank',
  target: 3,
  reward: { xp: 400, popularidade: 12, dinheiro: 150000, felicidade: 6 },
})
add({
  id: 'tit_dynasty_3peat',
  name: 'Três coroas',
  description: 'Uma dinastia no arquivo acumule 3 títulos na janela.',
  category: 'titulos',
  metric: 'dynastyTitlesBest',
  target: 3,
  reward: { xp: 350, popularidade: 10, dinheiro: 120000 },
})

// Legacy Engine
add({
  id: 'tit_legacy_45',
  name: 'Nome no mural',
  description: 'Alcance Legacy Score 45 (notável).',
  category: 'titulos',
  metric: 'legacyScore',
  target: 45,
  reward: { xp: 180, popularidade: 4, dinheiro: 35000 },
})
add({
  id: 'tit_legacy_60',
  name: 'Grande carreira',
  description: 'Alcance Legacy Score 60.',
  category: 'titulos',
  metric: 'legacyScore',
  target: 60,
  reward: { xp: 240, popularidade: 6, dinheiro: 60000, felicidade: 2 },
})
add({
  id: 'tit_legacy_75',
  name: 'Lenda viva',
  description: 'Alcance Legacy Score 75 (tier Lenda).',
  category: 'titulos',
  metric: 'legacyScore',
  target: 75,
  reward: { xp: 320, popularidade: 10, dinheiro: 100000, felicidade: 4 },
})
add({
  id: 'tit_legacy_top10',
  name: 'Top 10 histórico',
  description: 'Entre no top 10 do ranking histórico interno de legado.',
  category: 'titulos',
  metric: 'legacyTop10',
  target: 1,
  reward: { xp: 280, popularidade: 8, dinheiro: 80000 },
})

// ─── Estatísticas ───────────────────────────────────────────
const careerPts = [100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]
careerPts.forEach((n, i) => {
  add({
    id: `stat_pts_${n}`,
    name: `${n} pontos na carreira`,
    description: `Acumule ${n} pontos (career totals / analytics).`,
    category: 'estatisticas',
    metric: 'careerPoints',
    target: n,
    reward: stripZero(tierReward({ xp: 40, dinheiro: 3000 }, i)),
  })
})

const careerAst = [50, 100, 250, 500, 1000, 2000]
careerAst.forEach((n, i) => {
  add({
    id: `stat_ast_${n}`,
    name: `${n} assistências na carreira`,
    description: `Acumule ${n} assistências de carreira.`,
    category: 'estatisticas',
    metric: 'careerAssists',
    target: n,
    reward: stripZero(tierReward({ xp: 35, relCompanheiros: 1 }, i)),
  })
})

const careerReb = [50, 100, 250, 500, 1000, 2000]
careerReb.forEach((n, i) => {
  add({
    id: `stat_reb_${n}`,
    name: `${n} rebotes na carreira`,
    description: `Acumule ${n} rebotes de carreira.`,
    category: 'estatisticas',
    metric: 'careerRebounds',
    target: n,
    reward: stripZero(tierReward({ xp: 35, motivacao: 1 }, i)),
  })
})

;[15, 18, 20, 22, 25, 28].forEach((n, i) => {
  add({
    id: `stat_per_${n}`,
    name: `PER ${n}`,
    description: `Alcance PER de temporada ≥ ${n}.`,
    category: 'estatisticas',
    metric: 'seasonPer',
    target: n,
    reward: stripZero(tierReward({ xp: 50, popularidade: 2 }, i)),
  })
})

;[50, 55, 60, 65].forEach((n, i) => {
  add({
    id: `stat_ts_${n}`,
    name: `TS% ${n}`,
    description: `Alcance True Shooting ≥ ${n}% na temporada.`,
    category: 'estatisticas',
    metric: 'seasonTsPct',
    target: n,
    reward: stripZero(tierReward({ xp: 40, motivacao: 1 }, i)),
  })
})

;[10, 15, 20, 25].forEach((n, i) => {
  add({
    id: `stat_pie_${n}`,
    name: `PIE ${n}%`,
    description: `Alcance PIE de temporada ≥ ${n}%.`,
    category: 'estatisticas',
    metric: 'seasonPie',
    target: n,
    reward: stripZero(tierReward({ xp: 45, popularidade: 1 }, i)),
  })
})

;[1, 2, 5].forEach((n, i) => {
  add({
    id: `stat_ws_${n}`,
    name: `${n} Win Share(s)`,
    description: `Acumule ${n} Win Share(s) na temporada.`,
    category: 'estatisticas',
    metric: 'seasonWinShares',
    target: n,
    reward: stripZero(tierReward({ xp: 55, dinheiro: 5000 }, i)),
  })
})

add({
  id: 'stat_net_pos',
  name: 'Impacto positivo',
  description: 'Tenha Net Rating positivo na temporada.',
  category: 'estatisticas',
  metric: 'seasonNetPositive',
  target: 1,
  reward: { xp: 60, motivacao: 2 },
})
add({
  id: 'stat_usg_25',
  name: 'Alto uso',
  description: 'Usage Rate ≥ 25% na temporada.',
  category: 'estatisticas',
  metric: 'seasonUsg25',
  target: 1,
  reward: { xp: 50, popularidade: 2 },
})

// ─── Colecionáveis ──────────────────────────────────────────
const teamIds = ['gsw', 'bos', 'lal', 'mia', 'den', 'nyk']
teamIds.forEach((id) => {
  add({
    id: `col_team_${id}`,
    name: `Camisa ${id.toUpperCase()}`,
    description: `Jogue pelo menos uma semana no time ${id.toUpperCase()}.`,
    category: 'colecionaveis',
    metric: `playedTeam_${id}`,
    target: 1,
    reward: stripZero({ xp: 40, popularidade: 1, dinheiro: 5000 }),
  })
})

add({
  id: 'col_teams_2',
  name: 'Duas franquias',
  description: 'Jogue por 2 times diferentes na carreira.',
  category: 'colecionaveis',
  metric: 'teamsPlayed',
  target: 2,
  reward: { xp: 80, dinheiro: 15000, popularidade: 2 },
})
add({
  id: 'col_teams_3',
  name: 'Jornada',
  description: 'Jogue por 3 times diferentes.',
  category: 'colecionaveis',
  metric: 'teamsPlayed',
  target: 3,
  reward: { xp: 120, dinheiro: 25000, popularidade: 3 },
})

const storyThemes = [
  'companheiros',
  'treinador',
  'cidade',
  'patrocinios',
  'desempenho',
  'popularidade',
  'liga',
  'personalidade',
  'relacionamentos',
  'time',
]
storyThemes.forEach((theme) => {
  add({
    id: `col_story_${theme}`,
    name: `Arco: ${theme}`,
    description: `Complete ao menos um arco da Story Engine no tema ${theme}.`,
    category: 'colecionaveis',
    metric: `storyTheme_${theme}`,
    target: 1,
    reward: { xp: 45, felicidade: 1 },
  })
})

;[5, 10, 20].forEach((n, i) => {
  add({
    id: `col_flags_${n}`,
    name: `${n} flags narrativas`,
    description: `Acumule ${n} flags distintas na memória da Story Engine.`,
    category: 'colecionaveis',
    metric: 'storyFlagCount',
    target: n,
    reward: stripZero(tierReward({ xp: 40, felicidade: 2 }, i)),
  })
})

;[1, 3, 5].forEach((n, i) => {
  add({
    id: `col_chains_${n}`,
    name: n === 1 ? 'Primeira cadeia' : `${n} cadeias abertas`,
    description: `Tenha ${n} cadeia(s) narrativa(s) aberta(s) ou concluída(s) no histórico.`,
    category: 'colecionaveis',
    metric: 'storyChainsTotal',
    target: n,
    reward: stripZero(tierReward({ xp: 35 }, i)),
  })
})

add({
  id: 'col_injury_survive',
  name: 'De volta ao jogo',
  description: 'Recupere-se de uma lesão ativa.',
  category: 'colecionaveis',
  metric: 'injuryRecoveries',
  target: 1,
  reward: { motivacao: 4, xp: 60, felicidade: 2 },
})
add({
  id: 'col_invest_1',
  name: 'Investidor',
  description: 'Faça ao menos um investimento financeiro.',
  category: 'colecionaveis',
  metric: 'investmentsCount',
  target: 1,
  reward: { xp: 40, felicidade: 2, dinheiro: 0 },
})
add({
  id: 'col_records_1',
  name: 'Nome nos recordes',
  description: 'Tenha ao menos 1 recorde all-time no History Engine.',
  category: 'colecionaveis',
  metric: 'recordsCount',
  target: 1,
  reward: { xp: 90, popularidade: 3, dinheiro: 20000 },
})
add({
  id: 'col_records_3',
  name: 'Livro de recordes',
  description: 'Tenha 3 recordes all-time registrados.',
  category: 'colecionaveis',
  metric: 'recordsCount',
  target: 3,
  reward: { xp: 150, popularidade: 4, dinheiro: 35000 },
})
add({
  id: 'col_analytics_tracked',
  name: 'No radar Analytics',
  description: 'Tenha métricas avançadas rastreadas (1+ jogo).',
  category: 'colecionaveis',
  metric: 'analyticsGames',
  target: 1,
  reward: { xp: 30 },
})
add({
  id: 'col_scout_reports',
  name: 'Olheiro',
  description: 'Tenha relatórios de scouting ativos no GM.',
  category: 'colecionaveis',
  metric: 'scoutingReports',
  target: 1,
  reward: { xp: 35 },
})
add({
  id: 'col_coach_bond',
  name: 'Confiança do técnico',
  description: 'Mantenha relação com o treinador ≥ 80.',
  category: 'colecionaveis',
  metric: 'coachRel',
  target: 80,
  reward: { relTreinador: 2, xp: 50 },
})
add({
  id: 'col_unlock_50',
  name: 'Colecionador (50)',
  description: 'Desbloqueie 50 conquistas.',
  category: 'colecionaveis',
  metric: 'achievementsUnlocked',
  target: 50,
  reward: { dinheiro: 50000, xp: 200, popularidade: 5, felicidade: 5 },
})
add({
  id: 'col_unlock_100',
  name: 'Colecionador (100)',
  description: 'Desbloqueie 100 conquistas.',
  category: 'colecionaveis',
  metric: 'achievementsUnlocked',
  target: 100,
  reward: { dinheiro: 100000, xp: 400, popularidade: 8, felicidade: 8 },
})
add({
  id: 'col_unlock_150',
  name: 'Lenda das conquistas',
  description: 'Desbloqueie 150 conquistas.',
  category: 'colecionaveis',
  metric: 'achievementsUnlocked',
  target: 150,
  reward: { dinheiro: 200000, xp: 600, popularidade: 10, felicidade: 10 },
})

export const ACHIEVEMENTS = catalog
export const ACHIEVEMENT_COUNT = catalog.length
export const ACHIEVEMENTS_BY_ID = Object.fromEntries(
  catalog.map((a) => [a.id, a]),
)

if (ACHIEVEMENT_COUNT < 200) {
  // Fail fast in dev if generator shrinks below requirement
  console.warn(
    `[achievements] catálogo tem ${ACHIEVEMENT_COUNT} conquistas (mínimo 200).`,
  )
}
