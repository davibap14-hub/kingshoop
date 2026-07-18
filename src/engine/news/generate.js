import {
  MAX_NEWS_FEED,
  MAX_WEEKLY_NEWS,
  NEWS_CATEGORIES,
} from '../../data/news/constants'
import { getTeamById } from '../../data/teams'
import { collectWeekFacts } from './extract'

let _seq = 0

function nextId(week, seasonNumber) {
  _seq += 1
  return `news_s${seasonNumber}_w${week}_${_seq}`
}

function impact(categoryId, extras = {}) {
  const cat = NEWS_CATEGORIES[categoryId] ?? { tone: 'neutral' }
  return {
    category: categoryId,
    tone: extras.tone ?? cat.tone ?? 'neutral',
    magnitude: extras.magnitude ?? 2,
    description: extras.description ?? '',
    deltas: extras.deltas ?? {},
  }
}

function teamLabel(teamId) {
  return getTeamById(teamId)?.short ?? String(teamId).toUpperCase()
}

/**
 * Gera notícias da semana a partir dos fatos da liga.
 */
export function generateWeekNews(factsInput, opts = {}) {
  const facts =
    factsInput.weekResults != null
      ? factsInput
      : collectWeekFacts(factsInput)

  _seq = 0
  const items = []
  const week = facts.week
  const seasonNumber = facts.seasonNumber
  const playerTeamId = facts.playerTeamId

  const push = (partial) => {
    if (items.length >= (opts.max ?? MAX_WEEKLY_NEWS)) return
    items.push({
      id: nextId(week, seasonNumber),
      week,
      seasonNumber,
      category: partial.category,
      categoryLabel: NEWS_CATEGORIES[partial.category]?.label ?? partial.category,
      title: partial.title,
      summary: partial.summary,
      impact: partial.impact,
      refs: partial.refs ?? {},
      aboutPlayerTeam: Boolean(partial.aboutPlayerTeam),
    })
  }

  // —— Performances / Triple-Double / MVP / Recorde / Blowout ——
  for (const game of facts.weekResults ?? []) {
    for (const perf of game.performances ?? []) {
      if (perf.type === 'triple_double') {
        push({
          category: 'triple_double',
          title: `${perf.playerName} fecha com triple-double`,
          summary: `${perf.playerName} (${perf.teamShort}) registrou ${perf.points}/${perf.rebounds}/${perf.assists} na vitória/derrota da rodada.`,
          impact: impact('triple_double', {
            magnitude: 4,
            description: 'Destaque nacional eleva o holofote sobre o elenco.',
            deltas:
              perf.teamId === playerTeamId
                ? { popularidade: 2, motivacao: 1 }
                : {},
          }),
          refs: { playerId: perf.playerId, teamId: perf.teamId, gameId: game.gameId },
          aboutPlayerTeam: perf.teamId === playerTeamId,
        })
      }

      if (perf.type === 'scoring_burst') {
        push({
          category: 'record',
          title: `Explosão ofensiva: ${perf.playerName} marca ${perf.points}`,
          summary: `${perf.playerName} estourou a marca de 35 pontos por ${perf.teamShort}. Analistas falam em noite de recorde pessoal da temporada.`,
          impact: impact('record', {
            magnitude: 3,
            description: 'Recorde de pontuação semanal na liga.',
            deltas:
              perf.teamId === playerTeamId ? { popularidade: 1 } : {},
          }),
          refs: { playerId: perf.playerId, teamId: perf.teamId },
          aboutPlayerTeam: perf.teamId === playerTeamId,
        })
      }

      if (perf.type === 'game_mvp') {
        const bigNight = (perf.points ?? 0) >= 28
        push({
          category: 'mvp',
          title: `MVP da partida: ${perf.playerName}`,
          summary: `${perf.playerName} foi o melhor em quadra (${perf.points ?? 0} pts, ${perf.rebounds ?? 0} reb, ${perf.assists ?? 0} ast)${bigNight ? ' e entra na conversa de premiações.' : '.'}`,
          impact: impact('mvp', {
            magnitude: bigNight ? 3 : 2,
            description: bigNight
              ? 'Candidatura a prêmios individuais ganha força.'
              : 'Desempenho individual em evidência.',
            deltas:
              perf.teamId === playerTeamId
                ? { popularidade: bigNight ? 1 : 0, motivacao: 1 }
                : {},
          }),
          refs: { playerId: perf.playerId, teamId: perf.teamId },
          aboutPlayerTeam: perf.teamId === playerTeamId,
        })
      }

      if (perf.type === 'blowout') {
        const winner = teamLabel(perf.winnerId)
        push({
          category: 'blowout',
          title: `${winner} passeia com margem de ${perf.margin}`,
          summary: `Placar dilatado (${perf.homeScore}–${perf.awayScore}). A imprensa discute se é domínio ou desnível de elenco.`,
          impact: impact('blowout', {
            magnitude: 2,
            description: 'Resultado reforça narrativas de hierarquia na conferência.',
            deltas:
              perf.winnerId === playerTeamId
                ? { motivacao: 1 }
                : game.homeId === playerTeamId || game.awayId === playerTeamId
                  ? { motivacao: -1 }
                  : {},
          }),
          refs: { gameId: game.gameId, winnerId: perf.winnerId },
          aboutPlayerTeam:
            game.homeId === playerTeamId || game.awayId === playerTeamId,
        })
      }
    }

    // fallback MVP name only
    if (
      game.mvp &&
      !(game.performances ?? []).some((p) => p.type === 'game_mvp')
    ) {
      push({
        category: 'mvp',
        title: `${game.mvp} brilha como MVP do jogo`,
        summary: `${game.homeShort} ${game.homeScore}–${game.awayScore} ${game.awayShort}. ${game.mvp} foi o destaque da partida.`,
        impact: impact('mvp', {
          magnitude: 2,
          description: 'Desempenho individual em evidência.',
        }),
        refs: { gameId: game.gameId },
        aboutPlayerTeam:
          game.homeId === playerTeamId || game.awayId === playerTeamId,
      })
    }
  }

  // —— Lesões ——
  for (const inj of facts.leagueInjuries ?? []) {
    if ((inj.weeksRemaining ?? 0) <= 0) continue
    push({
      category: 'injury',
      title: `Lesão: ${inj.playerName} fora por ${inj.weeksRemaining} sem.`,
      summary: `${inj.playerName} (${inj.teamShort}) sofre ${inj.label}. O departamento médico avalia o retorno.`,
      impact: impact('injury', {
        magnitude: Math.min(5, 2 + (inj.weeksRemaining ?? 1)),
        description: 'Baixa altera rotações e expectativas da franquia.',
        deltas:
          inj.teamId === playerTeamId
            ? { motivacao: -2, felicidade: -1 }
            : {},
      }),
      refs: { playerId: inj.playerId, teamId: inj.teamId },
      aboutPlayerTeam: inj.teamId === playerTeamId,
    })
  }

  if (facts.careerInjury) {
    push({
      category: 'injury',
      title: `${facts.playerName ?? 'Seu jogador'} lida com ${facts.careerInjury.label}`,
      summary: `A recuperação prevê cerca de ${facts.careerInjury.weeksRemaining} semana(s). A imprensa pressiona o staff médico.`,
      impact: impact('injury', {
        magnitude: 4,
        description: 'Cobertura intensa sobre o status do atleta.',
        deltas: { motivacao: -1, popularidade: 1 },
      }),
      refs: { playerInjury: true },
      aboutPlayerTeam: true,
    })
  }

  // —— Decisões GM ——
  for (const d of facts.decisions ?? []) {
    if (d.type === 'legacy_tier_up' || d.type === 'legacy_recognized') {
      push({
        category: 'legacy',
        title:
          d.type === 'legacy_tier_up'
            ? `Legado: ${d.playerName} alcança ${d.tierLabel}`
            : `Legado em ascensão: ${d.playerName}`,
        summary: `Legacy Score ${d.score} (${d.tierLabel}). O ranking histórico interno e o Hall da Fama já sentem o peso da carreira. ${d.reason ?? ''}`,
        impact: impact('legacy', {
          magnitude: d.tier === 'immortal' || d.tier === 'legend' ? 5 : 3,
          description: 'Valor histórico e narrativas de carreira ganham tração.',
          deltas:
            d.playerId === 'career_player' || d.aboutPlayerTeam
              ? { popularidade: 2, motivacao: 1 }
              : { popularidade: 1 },
        }),
        refs: {
          playerId: d.playerId,
          teamId: d.teamId,
          tier: d.tier,
        },
        aboutPlayerTeam: d.playerId === 'career_player',
      })
    }

    if (d.type === 'dynasty_recognized' || d.type === 'dynasty_upgrade') {
      const c = d.criteria ?? {}
      push({
        category: 'dynasty',
        title:
          d.type === 'dynasty_upgrade'
            ? `${d.teamShort ?? teamLabel(d.teamId)} eleva a dinastia`
            : `Dinastia: ${d.teamShort ?? teamLabel(d.teamId)} entra para a história`,
        summary: `${d.tierLabel ?? 'Dinastia'} (${d.fromSeason ?? '?'}–${d.toSeason ?? '?'}): ${c.titles ?? 0} títulos, ${c.consecutiveFinals ?? 0} finais seguidas, ${c.mvps ?? 0} MVP(s), domínio em ${c.dominanceSeasons ?? 0} temporada(s). ${d.reason ?? ''}`,
        impact: impact('dynasty', {
          magnitude: d.tier === 'super' ? 6 : d.tier === 'dynasty' ? 5 : 4,
          description:
            'Reputação da franquia sobe; mercado de estrelas reage à aura de dinastia.',
          deltas:
            d.teamId === playerTeamId
              ? { popularidade: 3, motivacao: 2, felicidade: 1 }
              : { popularidade: 1 },
        }),
        refs: { teamId: d.teamId, dynastyId: d.dynastyId, tier: d.tier },
        aboutPlayerTeam: d.teamId === playerTeamId,
      })
    }

    if (d.type === 'expansion') {
      push({
        category: 'expansion',
        title: 'Liga anuncia expansão',
        summary: `${(d.teamNames ?? d.teamIds ?? []).join(' e ')} entram na liga. Expansion Draft e novo calendário começam agora. ${d.reason ?? ''}`,
        impact: impact('expansion', {
          magnitude: 5,
          description: 'Mercado redesenha elencos; torcidas novas chegam.',
          deltas: { popularidade: 1, motivacao: 1 },
        }),
        refs: { teamIds: d.teamIds },
        aboutPlayerTeam: false,
      })
    }

    if (d.type === 'expansion_draft') {
      push({
        category: 'expansion',
        title: `${teamLabel(d.teamId)} seleciona ${d.playerName} no Expansion Draft`,
        summary: `#${d.pickNumber}: ${d.playerName} (${d.posicao ?? '—'}, OVR ${d.overall ?? '—'}) deixa ${teamLabel(d.fromTeamId)}.`,
        impact: impact('expansion', {
          magnitude: 3,
          description: 'Elenco de expansão ganha peça; doador recalcula o futuro.',
          deltas:
            d.fromTeamId === playerTeamId
              ? { relCompanheiros: -1, motivacao: -1 }
              : {},
        }),
        refs: {
          teamId: d.teamId,
          fromTeamId: d.fromTeamId,
          playerId: d.playerId,
        },
        aboutPlayerTeam: d.fromTeamId === playerTeamId,
      })
    }

    if (d.type === 'trade') {
      const summary =
        d.assetsSummary ??
        `${d.playerName} ⇄ ${d.acquiredName ?? 'peça'}`
      push({
        category: 'trade',
        title: `Troca: ${teamLabel(d.teamId)} ⇄ ${teamLabel(d.partnerId)}`,
        summary: `${teamLabel(d.teamId)} e ${teamLabel(d.partnerId)}: ${summary}. ${d.reason ?? ''}`,
        impact: impact('trade', {
          magnitude: 4,
          description: 'Mercado reage à troca; química dos elencos em xeque.',
          deltas:
            d.teamId === playerTeamId || d.partnerId === playerTeamId
              ? { relCompanheiros: -1, motivacao: 1 }
              : {},
        }),
        refs: {
          teamId: d.teamId,
          partnerId: d.partnerId,
          playerId: d.playerId,
        },
        aboutPlayerTeam:
          d.teamId === playerTeamId || d.partnerId === playerTeamId,
      })
    }

    if (d.type === 'sign') {
      push({
        category: 'signing',
        title: `${teamLabel(d.teamId)} contrata ${d.playerName}`,
        summary: `Acordo anunciado${d.yearlySalary ? ` (≈$${(d.yearlySalary / 1e6).toFixed(1)}M/ano)` : ''}. ${d.reason ?? 'Reforço de elenco.'}`,
        impact: impact('signing', {
          magnitude: 2,
          description: 'Torcida avalia se o encaixe resolve necessidades.',
          deltas: d.teamId === playerTeamId ? { motivacao: 1 } : {},
        }),
        refs: { teamId: d.teamId, playerId: d.playerId },
        aboutPlayerTeam: d.teamId === playerTeamId,
      })
    }

    if (d.type === 'release') {
      const retirement = /veterano|aposent|idade/i.test(d.reason ?? '')
      push({
        category: retirement ? 'retirement' : 'criticism',
        title: retirement
          ? `Fim de ciclo? ${d.playerName} deixa ${teamLabel(d.teamId)}`
          : `${teamLabel(d.teamId)} dispensa ${d.playerName}`,
        summary: `${d.reason ?? 'Corte no elenco.'} A imprensa debate o timing da decisão.`,
        impact: impact(retirement ? 'retirement' : 'criticism', {
          magnitude: 3,
          description: retirement
            ? 'Rumores de aposentadoria ganham força.'
            : 'Críticas à gestão do elenco.',
          deltas:
            d.teamId === playerTeamId
              ? { relCompanheiros: retirement ? -1 : -2 }
              : {},
        }),
        refs: { teamId: d.teamId, playerId: d.playerId },
        aboutPlayerTeam: d.teamId === playerTeamId,
      })
    }

    if (d.type === 'draft') {
      push({
        category: 'draft',
        title: `Draft: ${teamLabel(d.teamId)} seleciona ${d.playerName}`,
        summary: `Pick #${d.pickNumber ?? '—'}${d.universidade ? ` · ${d.universidade}` : ''}${d.posicao ? ` · ${d.posicao}` : ''}. Novo talento chega à liga.`,
        impact: impact('draft', {
          magnitude: 3,
          description: 'Expectativa de desenvolvimento sobe na franquia.',
          deltas: d.teamId === playerTeamId ? { motivacao: 1 } : {},
        }),
        refs: { teamId: d.teamId, playerId: d.playerId },
        aboutPlayerTeam: d.teamId === playerTeamId,
      })
    }

    if (d.type === 'renew') {
      push({
        category: 'rumor',
        title: `Renovação: ${d.playerName} segue em ${teamLabel(d.teamId)}`,
        summary: `Contrato estendido. Bastidores indicavam negociação avançada há semanas.`,
        impact: impact('rumor', {
          magnitude: 2,
          description: 'Estabilidade no vestiário.',
          deltas: d.teamId === playerTeamId ? { relCompanheiros: 1 } : {},
        }),
        refs: { teamId: d.teamId, playerId: d.playerId },
        aboutPlayerTeam: d.teamId === playerTeamId,
      })
    }
  }

  // —— Rumores / mudança de objetivo ——
  for (const change of facts.objectiveChanges ?? []) {
    push({
      category: 'rumor',
      title: `Bastidores: ${teamLabel(change.teamId)} mira ${change.label ?? change.to}`,
      summary: `A Franchise AI ajustou o plano (${change.from} → ${change.to}). ${change.reason ?? ''}`,
      impact: impact('rumor', {
        magnitude: 2,
        description: 'Mercado especula próximos movimentos.',
      }),
      refs: { teamId: change.teamId },
      aboutPlayerTeam: change.teamId === playerTeamId,
    })
  }

  // —— Críticas por campanha ——
  const standing = facts.standings?.[playerTeamId]
  if (standing && (standing.wins ?? 0) + (standing.losses ?? 0) >= 8) {
    const games = standing.wins + standing.losses
    const pct = standing.wins / games
    if (pct < 0.35) {
      push({
        category: 'criticism',
        title: `Críticas cercam ${teamLabel(playerTeamId)} após sequência fraca`,
        summary: `Record ${standing.wins}-${standing.losses}. Colunistas cobram mudanças no elenco e no plano de jogo.`,
        impact: impact('criticism', {
          magnitude: 3,
          description: 'Pressão da mídia afeta o clima interno.',
          deltas: { motivacao: -2, felicidade: -1, popularidade: -1 },
        }),
        refs: { teamId: playerTeamId },
        aboutPlayerTeam: true,
      })
    } else if (pct >= 0.7) {
      push({
        category: 'mvp',
        title: `${teamLabel(playerTeamId)} entra no páreo de título`,
        summary: `Com aproveitamento alto (${standing.wins}-${standing.losses}), a narrativa de candidata ganha força na liga.`,
        impact: impact('mvp', {
          magnitude: 3,
          description: 'Cobertura positiva impulsiona a marca do time.',
          deltas: { motivacao: 1, popularidade: 1 },
        }),
        refs: { teamId: playerTeamId },
        aboutPlayerTeam: true,
      })
    }
  }

  // —— Prêmios / campeão ——
  if (facts.awards) {
    const a = facts.awards
    if (a.mvp) {
      const mvpLabel =
        a.mvp.teamShort ??
        (a.mvp.teamId ? teamLabel(a.mvp.teamId) : null) ??
        'Franquia líder'
      push({
        category: 'award',
        title: `MVP da temporada: ${mvpLabel}`,
        summary: `A premiação oficial reconhece a temporada dominante${a.mvp.detail ? ` (${a.mvp.detail})` : ''}.`,
        impact: impact('award', {
          magnitude: 5,
          description: 'Marco histórico da temporada.',
        }),
        refs: { award: 'mvp', teamId: a.mvp.teamId },
        aboutPlayerTeam: a.mvp.teamId === playerTeamId,
      })
    }
  }

  if (facts.champion) {
    push({
      category: 'award',
      title: `${teamLabel(facts.champion)} é campeã da liga`,
      summary: `O título fecha a temporada ${facts.seasonNumber}. Desfiles, críticas aos rivais e rumores de offseason começam agora.`,
      impact: impact('award', {
        magnitude: 5,
        description: 'Dinastia ou one-off? O debate começa.',
        deltas:
          facts.champion === playerTeamId
            ? { felicidade: 5, popularidade: 4, motivacao: 3 }
            : { motivacao: -1 },
      }),
      refs: { teamId: facts.champion },
      aboutPlayerTeam: facts.champion === playerTeamId,
    })
  }

  // Prioriza notícias do time do jogador + magnitude
  items.sort((a, b) => {
    if (a.aboutPlayerTeam !== b.aboutPlayerTeam) {
      return a.aboutPlayerTeam ? -1 : 1
    }
    return (b.impact?.magnitude ?? 0) - (a.impact?.magnitude ?? 0)
  })

  return items.slice(0, opts.max ?? MAX_WEEKLY_NEWS)
}

/**
 * Pipeline semanal do News Engine.
 */
export function processWeeklyNews(context = {}, opts = {}) {
  const facts = collectWeekFacts(context)
  const weekNews = generateWeekNews(facts, opts)
  const prevFeed = context.newsFeed ?? []
  const newsFeed = [...weekNews, ...prevFeed].slice(0, MAX_NEWS_FEED)

  const messages = weekNews.slice(0, 3).map((n) => `News: ${n.title}`)

  // soma impactos sobre o jogador (só deltas de notícias aboutPlayerTeam ou gerais com deltas)
  const deltas = {}
  for (const n of weekNews) {
    const d = n.impact?.deltas ?? {}
    for (const [k, v] of Object.entries(d)) {
      if (!v) continue
      deltas[k] = (deltas[k] ?? 0) + v
    }
  }

  return {
    weekNews,
    newsFeed,
    deltas,
    messages,
    summary: {
      week: facts.week,
      seasonNumber: facts.seasonNumber,
      count: weekNews.length,
      headlines: weekNews.map((n) => n.title),
    },
  }
}

export function createEmptyNewsState() {
  return {
    weekNews: [],
    newsFeed: [],
  }
}
