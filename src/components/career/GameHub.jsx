/**
 * Hub principal de jogo — o que o jogador pode fazer agora.
 * Prioridade: Story → Decisão → Partida → Objetivos → Notícias → Evolução → Conquistas.
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamById } from '../../data/teams'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import {
  AchievementGlow,
  ConfettiBurst,
  CountUp,
  Pulse,
  SkeletonBlock,
  SlideUp,
} from '../motion'
import { Badge, Button, Card, ProgressBar } from '../ui'
import ContractOfferPanel from './ContractOfferPanel'
import EventChoicePanel from './EventChoicePanel'
import GameHubHero from './GameHubHero'

const NEWS_TONE = {
  positive: 'blue',
  negative: 'danger',
  neutral: 'neutral',
}

export default function GameHub({
  playerName,
  team,
  overall,
  status,
  injury,
  player,
  currentWeek,
  currentSeason,
  currentTeamId,
  seasonView,
  finance,
  progression,
  weekEffects,
}) {
  const availableActivities = useGameStore((s) => s.availableActivities)
  const selectedActivityId = useGameStore((s) => s.selectedActivityId)
  const setSelectedActivity = useGameStore((s) => s.setSelectedActivity)
  const runWeek = useGameStore((s) => s.runWeek)
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const pendingContractOffer = useGameStore((s) => s.pendingContractOffer)
  const story = useGameStore((s) => s.story)
  const gm = useGameStore((s) => s.gm)
  const weekNews = useGameStore((s) => s.weekNews)
  const newsFeed = useGameStore((s) => s.newsFeed)
  const achievements = useGameStore((s) => s.achievements)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const seasonResults = useGameStore((s) => s.season?.results)
  const [confetti, setConfetti] = useState(false)
  const confettiKeyRef = useRef(null)

  const storyView = gameService.getStoryView({ story, pendingEvent })
  const achView = gameService.getAchievementsView({ achievements })

  const blocked = Boolean(pendingEvent || pendingContractOffer)

  useEffect(() => {
    if (!weekEffects?.progression?.leveledUp) return
    const key = `${weekEffects.seasonNumber ?? currentSeason}-${weekEffects.weekFrom ?? currentWeek}`
    if (confettiKeyRef.current === key) return
    confettiKeyRef.current = key
    setConfetti(true)
  }, [
    weekEffects?.progression?.leveledUp,
    weekEffects?.weekFrom,
    weekEffects?.seasonNumber,
    currentWeek,
    currentSeason,
  ])
  const ctaLabel = pendingContractOffer
    ? 'Resolva o contrato'
    : pendingEvent
      ? 'Resolva a história'
      : 'Avançar Semana'

  const next = seasonView?.nextGame
  const homeTeam = next ? getTeamById(next.game.homeId) : team
  const awayTeam = next ? getTeamById(next.game.awayId) : null
  const isHome = next ? next.game.homeId === currentTeamId : true
  const opponent = next
    ? isHome
      ? awayTeam
      : homeTeam
    : null

  const objectives = buildWeeklyObjectives({
    gm,
    currentTeamId,
    storyView,
    status,
    injury,
    progression,
    seasonView,
  })

  const importantNews = pickImportantNews({
    weekEffects,
    weekNews,
    newsFeed,
  })

  const recentAchievements = [
    ...(weekEffects?.achievements?.newlyUnlocked ?? []),
    ...(achView.recent ?? []),
  ]
    .filter(
      (a, i, arr) =>
        arr.findIndex((x) => (x.id ?? x.name) === (a.id ?? a.name)) === i,
    )
    .slice(0, 4)

  const selected = availableActivities.find((a) => a.id === selectedActivityId)

  return (
    <div className="flex flex-col gap-6">
      <ConfettiBurst active={confetti} onComplete={() => setConfetti(false)} />

      <GameHubHero
        playerName={playerName}
        team={team}
        overall={overall}
        player={player}
        status={status}
        injury={injury}
        currentWeek={currentWeek}
        currentSeason={currentSeason}
        seasonView={seasonView}
        archetypeId={archetypeId}
        seasonResults={seasonResults ?? []}
        ctaLabel={ctaLabel}
        onCta={() => runWeek(selectedActivityId)}
        ctaDisabled={blocked}
        selectedActivityLabel={!blocked && selected ? selected.label : null}
      />

      {/* 1. História atual */}
      <HubSection
        index="01"
        eyebrow="História atual"
        title="O que está acontecendo"
        accent
      >
        <EventChoicePanel />
        {!pendingEvent && storyView.openChains?.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {storyView.openChains.slice(0, 3).map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{c.themeLabel}</Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Cap. {c.stage + 1}/{c.maxStages}
                  </span>
                </div>
                <p className="mt-1 font-display text-base font-bold text-navy">
                  {c.title}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {!pendingEvent &&
        !storyView.openChains?.length &&
        !storyView.counts.resolved ? (
          <p className="text-sm text-slate-500">
            Avance a semana — histórias da carreira podem surgir a qualquer momento.
          </p>
        ) : null}
      </HubSection>

      {/* 2. Próxima decisão */}
      <HubSection
        index="02"
        eyebrow="Próxima decisão"
        title="Escolha o foco da semana"
      >
        <ContractOfferPanel />

        {blocked ? (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {pendingContractOffer
              ? 'Há uma oferta de contrato pendente. Resolva antes de avançar.'
              : 'Há uma história pendente. Escolha uma opção acima para continuar.'}
          </p>
        ) : (
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {availableActivities.map((activity) => {
              const active = selectedActivityId === activity.id
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => setSelectedActivity(activity.id)}
                  className={[
                    'rounded-2xl border p-5 text-left transition',
                    active
                      ? 'border-navy bg-navy text-white shadow-lg shadow-navy/20 scale-[1.01]'
                      : 'border-slate-200 bg-white hover:border-navy/40 hover:shadow-md',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-[10px] font-bold uppercase tracking-[0.16em]',
                      active ? 'text-blue-200' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {activity.suggested ? 'Sugerida' : 'Atividade'}
                  </span>
                  <span
                    className={[
                      'mt-1 block font-display text-xl font-extrabold',
                      active ? 'text-white' : 'text-navy',
                    ].join(' ')}
                  >
                    {activity.label}
                  </span>
                  <span
                    className={[
                      'mt-2 block text-sm leading-snug',
                      active ? 'text-blue-100/90' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {activity.description}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            variant="accent"
            size="lg"
            className="!rounded-xl !px-8"
            onClick={() => runWeek(selectedActivityId)}
            disabled={blocked}
          >
            {ctaLabel}
          </Button>
        </div>
      </HubSection>

      {/* MyPLAYER */}
      <HubSection index="01z" eyebrow="MyPLAYER" title={playerName}>
        <Card
          padding="lg"
          className="border-navy/10 bg-gradient-to-br from-slate-50 to-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy font-display text-xl font-black text-amber-300">
                {overall}
              </div>
              <div>
                <Badge tone="warning">Perfil 2K</Badge>
                <p className="mt-1 text-sm text-slate-600">
                  {player?.posicao ?? '—'} · atributos, DNA, badges, contratos e
                  timeline.
                </p>
              </div>
            </div>
            <Link
              to="/player-profile"
              className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition hover:bg-navy-hover"
            >
              Abrir perfil
            </Link>
          </div>
        </Card>
      </HubSection>

      {/* Franquia */}
      <HubSection
        index="01a"
        eyebrow="Franquia"
        title={team?.name ?? 'Sua franquia'}
      >
        <Card padding="lg" className="border-navy/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge tone="blue">Franchise Hub</Badge>
              <p className="mt-2 text-sm text-slate-600">
                Elenco, contratos, cap, química, rotação, coach, GM, objetivos,
                picks e histórico — tudo pelas Engines.
              </p>
            </div>
            <Link
              to="/franchise"
              className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition hover:bg-navy-hover"
            >
              Abrir Franquia
            </Link>
          </div>
        </Card>
      </HubSection>

      {/* NBA TV */}
      <HubSection index="01b" eyebrow="NBA TV" title="Portal de notícias da liga">
        <Card
          padding="lg"
          className="border-red-500/20 bg-gradient-to-br from-[#0a1220] via-[#152845] to-[#1a3352] text-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Ao vivo
              </span>
              <p className="mt-2 text-sm text-blue-100/85">
                Últimas notícias, rumores, performances, recordes, Power Ranking
                e prêmios — só dados das Engines.
              </p>
            </div>
            <Link
              to="/nba-tv"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition hover:bg-red-500"
            >
              Abrir NBA TV
            </Link>
          </div>
        </Card>
      </HubSection>

      {/* Free Agency */}
      {(gm?.freeAgents?.length ?? 0) > 0 ? (
        <HubSection
          index="02a"
          eyebrow="Free Agency"
          title="Mercado de agentes livres"
        >
          <Card padding="lg" className="border-navy/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge tone="blue">Contract Engine</Badge>
                <p className="mt-2 text-sm text-slate-600">
                  {gm.freeAgents.length} FA(s) · interesse das franquias, pedido
                  salarial, rumores e negociação.
                </p>
              </div>
              <Link
                to="/free-agency"
                className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition hover:bg-navy-hover"
              >
                Abrir Free Agency
              </Link>
            </div>
          </Card>
        </HubSection>
      ) : null}

      {/* Draft Night — quando a classe está na mesa ou há replay */}
      {(gm?.draftClass?.length > 0 && !gm?.draftComplete) ||
      gm?.lastDraft?.picks?.length > 0 ? (
        <HubSection
          index="02b"
          eyebrow="Draft Night"
          title={
            gm?.draftClass?.length > 0 && !gm?.draftComplete
              ? 'A noite do Draft está no ar'
              : 'Replay do último Draft'
          }
        >
          <Card
            padding="lg"
            className="border-red-500/20 bg-gradient-to-br from-[#0b1524] via-[#152f4d] to-[#1a3a5c] text-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Ao vivo
                </span>
                <p className="mt-2 text-sm text-blue-100/85">
                  Relógio · Mock Draft · board · necessidades · análise · torcida ·
                  ticker — atualiza a cada escolha.
                </p>
              </div>
              <Link
                to="/draft-night"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy no-underline transition hover:bg-amber-300"
              >
                Abrir Draft Night
              </Link>
            </div>
          </Card>
        </HubSection>
      ) : null}

      {/* 3. Próxima partida */}
      <HubSection
        index="03"
        eyebrow="Próxima partida"
        title={
          next
            ? `${isHome ? 'vs' : '@'} ${opponent?.short ?? '—'}`
            : 'Sem jogo agendado'
        }
      >
        <Card padding="lg" className="border-navy/10 bg-gradient-to-b from-slate-50 to-white">
          {next ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <TeamFace team={homeTeam} align="left" />
                <div className="text-center">
                  <p className="font-display text-3xl font-black text-slate-300">
                    VS
                  </p>
                  <Badge tone="blue" className="mt-2">
                    Semana {next.week ?? currentWeek}
                  </Badge>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {isHome ? 'Casa' : 'Visitante'}
                  </p>
                </div>
                <TeamFace team={awayTeam} align="right" />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {next.game?.label ?? 'Partida da liga'} · tip-off 19:30
                </p>
                <Link
                  to="/match-center"
                  className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition hover:bg-navy-hover"
                >
                  Match Center
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Nenhum confronto na fila desta semana. Avance o calendário da temporada.
            </p>
          )}
        </Card>
      </HubSection>

      {/* 4. Objetivos semanais */}
      <HubSection index="04" eyebrow="Objetivos semanais" title="Foque nisto">
        <ul className="grid gap-3 sm:grid-cols-2">
          {objectives.map((obj) => (
            <li
              key={obj.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Badge tone={obj.tone ?? 'neutral'}>{obj.tag}</Badge>
              </div>
              <p className="mt-2 font-display text-lg font-bold text-navy">
                {obj.title}
              </p>
              {obj.detail ? (
                <p className="mt-1 text-sm text-slate-500">{obj.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </HubSection>

      {/* 5. Notícias importantes */}
      <HubSection
        index="05"
        eyebrow="Notícias importantes"
        title="O que a liga está falando"
      >
        {importantNews.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Sem manchetes críticas ainda. Avance uma semana para gerar notícias.
            </p>
            <SkeletonBlock lines={3} />
          </div>
        ) : (
          <ul className="space-y-3">
            {importantNews.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pulse
                    active={Boolean(n.aboutPlayerTeam || n.impact?.tone === 'negative')}
                    color={
                      n.impact?.tone === 'negative' ? '#f43f5e' : '#1d6fea'
                    }
                  >
                    <Badge tone={NEWS_TONE[n.impact?.tone] ?? 'neutral'}>
                      {n.categoryLabel ?? n.category}
                    </Badge>
                  </Pulse>
                  {n.aboutPlayerTeam ? (
                    <Badge tone="blue">Seu time</Badge>
                  ) : null}
                </div>
                <h4 className="mt-2 font-display text-base font-bold text-navy">
                  {n.title}
                </h4>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {n.summary}
                </p>
              </li>
            ))}
          </ul>
        )}
      </HubSection>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 6. Evolução recente */}
        <HubSection
          index="06"
          eyebrow="Evolução recente"
          title="Progresso"
          compact
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                Nível{' '}
                <CountUp
                  value={progression?.level ?? 1}
                  className="font-semibold text-navy"
                />
              </span>
              <span className="tabular-nums font-semibold text-navy">
                XP <CountUp value={progression?.xp ?? 0} />
                {progression?.xpToNext ? (
                  <>
                    {' / '}
                    <CountUp value={progression.xpToNext} />
                  </>
                ) : null}
              </span>
            </div>
            <ProgressBar
              value={
                progression?.xpToNext
                  ? Math.min(
                      100,
                      Math.round(
                        ((progression.xp ?? 0) / progression.xpToNext) * 100,
                      ),
                    )
                  : 100
              }
            />
            {weekEffects?.progression?.xpGain != null ? (
              <p className="mt-3 text-sm font-semibold text-accent">
                Última semana: +{weekEffects.progression.xpGain} XP
                {weekEffects.progression.leveledUp
                  ? ` · subiu de nível (+${weekEffects.progression.pointsGained} pt)`
                  : ''}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Avance a semana para registrar evolução.
              </p>
            )}
            <DeltaChips deltas={weekEffects?.deltas} attrs={weekEffects?.attributeDeltas} />
            {(progression?.evolutionPoints ?? 0) > 0 ? (
              <p className="mt-3 text-xs font-semibold text-navy">
                {progression.evolutionPoints} ponto(s) de evolução disponíveis
                (veja Detalhes ↓).
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-slate-400">
              Caixa ${Number(status?.dinheiro ?? finance?.caixa ?? 0).toLocaleString('en-US')}
            </p>
          </div>
        </HubSection>

        {/* 7. Conquistas recentes */}
        <HubSection
          index="07"
          eyebrow="Conquistas recentes"
          title="Troféus"
          compact
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs text-slate-500">
              <CountUp value={achView.unlockedCount} />/
              <CountUp value={achView.total} /> ·{' '}
              <CountUp value={achView.percent} />%
            </p>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma conquista recente. Continue avançando semanas.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentAchievements.map((a) => (
                  <li key={a.id ?? a.name}>
                    <AchievementGlow active intensity="md">
                      <div className="rounded-xl bg-amber-50/80 px-3 py-2 ring-1 ring-amber-200/60">
                        <p className="text-sm font-bold text-navy">{a.name}</p>
                        {a.description ? (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {a.description}
                          </p>
                        ) : null}
                      </div>
                    </AchievementGlow>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </HubSection>
      </div>

      {/* CTA sticky inferior */}
      <div className="sticky bottom-3 z-20">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-navy/20 bg-navy/95 px-4 py-3 text-white shadow-2xl backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
              Ação principal
            </p>
            <p className="truncate text-sm font-semibold">
              {blocked
                ? ctaLabel
                : `Semana ${currentWeek} · ${selected?.label ?? 'Escolha uma atividade'}`}
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            className="shrink-0 !rounded-xl"
            onClick={() => runWeek(selectedActivityId)}
            disabled={blocked}
          >
            Avançar Semana
          </Button>
        </div>
      </div>
    </div>
  )
}

function HubSection({
  index,
  eyebrow,
  title,
  children,
  accent = false,
  delay = 0,
}) {
  return (
    <SlideUp
      as="section"
      delay={delay}
      className={[
        'rounded-2xl border p-4 shadow-lift backdrop-blur-xl sm:p-6',
        accent
          ? 'border-[color-mix(in_srgb,var(--ds-accent)_28%,transparent)] bg-white/80'
          : 'border-white/50 bg-white/70',
      ].join(' ')}
    >
      <header className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-2xl font-black tabular-nums text-slate-200">
          {index}
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-muted)]">
            {eyebrow}
          </p>
          <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-navy sm:text-2xl">
            {title}
          </h2>
        </div>
      </header>
      {children}
    </SlideUp>
  )
}

function TeamFace({ team, align }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
        {team?.short ?? '—'}
      </p>
      <p className="max-w-[9rem] truncate text-sm text-slate-500">
        {team?.name ?? 'A definir'}
      </p>
    </div>
  )
}

function DeltaChips({ deltas = {}, attrs = {} }) {
  const entries = [
    ...Object.entries(deltas || {}).filter(([, v]) => v),
    ...Object.entries(attrs || {}).map(([k, v]) => [`attr:${k}`, v]),
  ]
  if (!entries.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {entries.slice(0, 8).map(([key, value]) => (
        <span
          key={key}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            value > 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {key.replace('attr:', '')} {value > 0 ? '+' : ''}
          {value}
        </span>
      ))}
    </div>
  )
}

function buildWeeklyObjectives({
  gm,
  currentTeamId,
  storyView,
  status,
  injury,
  progression,
  seasonView,
}) {
  const list = []
  if ((gm?.freeAgents?.length ?? 0) > 0) {
    list.push({
      id: 'free-agency',
      tag: 'Mercado',
      tone: 'blue',
      title: 'Explorar Free Agency',
      detail: `${gm.freeAgents.length} agente(s) livre(s) — negocie via Contract Engine.`,
    })
  }

  if (gm?.draftClass?.length > 0 && !gm?.draftComplete) {
    list.push({
      id: 'draft-night',
      tag: 'Draft',
      tone: 'warning',
      title: 'Assistir à Draft Night',
      detail: `${gm.draftClass.length} prospects na mesa — transmissão ao vivo.`,
    })
  }

  const obj = gm?.objectives?.[currentTeamId]
  if (obj) {
    list.push({
      id: 'franchise',
      tag: 'Franquia',
      tone: 'blue',
      title: obj.label ?? obj.objectiveId ?? 'Objetivo da franquia',
      detail: obj.reason ?? obj.description ?? 'Alinhe sua semana ao plano do time.',
    })
  }

  const chain = storyView?.openChains?.[0]
  if (chain) {
    list.push({
      id: `story-${chain.id}`,
      tag: 'História',
      tone: 'neutral',
      title: chain.title,
      detail: `${chain.themeLabel} · cap. ${chain.stage + 1}/${chain.maxStages}`,
    })
  }

  if (injury) {
    list.push({
      id: 'injury',
      tag: 'Saúde',
      tone: 'danger',
      title: `Recuperar de ${injury.label}`,
      detail: injury.weeksRemaining
        ? `~${injury.weeksRemaining} semana(s) restantes`
        : 'Priorize recuperação.',
    })
  } else if ((status?.energia ?? 100) < 45) {
    list.push({
      id: 'energy',
      tag: 'Corpo',
      tone: 'neutral',
      title: 'Recuperar energia',
      detail: 'Energia baixa — descanso ou carga leve ajudam o desempenho.',
    })
  }

  if ((progression?.evolutionPoints ?? 0) > 0) {
    list.push({
      id: 'evo',
      tag: 'Evolução',
      tone: 'blue',
      title: 'Investir pontos de evolução',
      detail: `${progression.evolutionPoints} ponto(s) prontos para atributos.`,
    })
  }

  const record = seasonView?.teamRecord
  if (record) {
    list.push({
      id: 'record',
      tag: 'Temporada',
      tone: 'neutral',
      title: `Manter ritmo ${record.wins}-${record.losses}`,
      detail: record.streakLabel
        ? `Sequência atual: ${record.streakLabel}`
        : 'Contribua na próxima partida da liga.',
    })
  }

  if (!list.length) {
    list.push({
      id: 'default',
      tag: 'Semana',
      tone: 'neutral',
      title: 'Escolher atividade e avançar',
      detail: 'Treino, mídia ou descanso — cada escolha move a carreira.',
    })
  }

  return list.slice(0, 4)
}

function pickImportantNews({ weekEffects, weekNews, newsFeed }) {
  const pool =
    weekEffects?.weekNews?.length > 0
      ? weekEffects.weekNews
      : weekNews?.length > 0
        ? weekNews
        : (newsFeed ?? []).slice(0, 12)

  const ranked = [...pool].sort((a, b) => {
    const score = (n) =>
      (n.aboutPlayerTeam ? 10 : 0) + (n.impact?.magnitude ?? 0)
    return score(b) - score(a)
  })

  return ranked.slice(0, 3)
}
