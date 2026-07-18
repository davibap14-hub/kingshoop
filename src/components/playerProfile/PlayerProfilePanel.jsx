/**
 * Interface — perfil estilo NBA 2K.
 * Só renderiza o DTO da Player Profile Engine.
 */

import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, LineChart, RadarChart } from '../charts'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Avatar, Badge, Button, Card, ProgressBar } from '../ui'

const TIMELINE_TONE = {
  week: 'neutral',
  achievement: 'blue',
  story: 'warning',
  injury: 'danger',
}

export default function PlayerProfilePanel() {
  const navigate = useNavigate()
  const player = useGameStore((s) => s.player)
  const playerName = useGameStore((s) => s.playerName)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const progression = useGameStore((s) => s.progression)
  const careerStats = useGameStore((s) => s.careerStats)
  const history = useGameStore((s) => s.history)
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const achievements = useGameStore((s) => s.achievements)
  const analytics = useGameStore((s) => s.analytics)
  const contract = useGameStore((s) => s.contract)
  const contractEngine = useGameStore((s) => s.contractEngine)
  const pendingContractOffer = useGameStore((s) => s.pendingContractOffer)
  const injury = useGameStore((s) => s.injury)
  const injuryEngine = useGameStore((s) => s.injuryEngine)
  const story = useGameStore((s) => s.story)
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const legacy = useGameStore((s) => s.legacy)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = useMemo(
    () =>
      gameService.getPlayerProfileView({
        player,
        playerName,
        archetypeId,
        currentTeamId,
        currentWeek,
        currentSeason,
        progression,
        careerStats,
        history,
        leagueHistory,
        achievements,
        analytics,
        contract,
        contractEngine,
        pendingContractOffer,
        injury,
        injuryEngine,
        story,
        pendingEvent,
        legacy,
        lastWeekResult: weekEffects ? { dna: weekEffects.dna } : null,
      }),
    [
      player,
      playerName,
      archetypeId,
      currentTeamId,
      currentWeek,
      currentSeason,
      progression,
      careerStats,
      history,
      leagueHistory,
      achievements,
      analytics,
      contract,
      contractEngine,
      pendingContractOffer,
      injury,
      injuryEngine,
      story,
      pendingEvent,
      legacy,
      weekEffects,
    ],
  )

  if (!view.available) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Perfil
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy">
          Perfil indisponível
        </h2>
        <p className="mt-2 text-sm text-slate-500">{view.message}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Voltar ao hub
        </Button>
      </Card>
    )
  }

  const id = view.identity
  const av = view.careerStats.analytics

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Header 2K */}
      <section className="relative overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-br from-[#0b1524] via-[#132c4a] to-[#1a4068] p-5 text-white shadow-xl sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 70% 0%, rgba(250,204,21,0.2), transparent 45%), radial-gradient(ellipse at 10% 100%, rgba(56,189,248,0.12), transparent 50%)',
          }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          {/* Foto placeholder */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-b from-slate-700/80 to-slate-900/90 shadow-lg sm:h-44 sm:w-44">
              <Avatar
                name={id.nome}
                size="xl"
                className="!h-24 !w-24 !text-3xl !bg-navy/80"
              />
              <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
                Foto
              </span>
            </div>
            <Badge tone="warning">{id.arquetipoLabel}</Badge>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
              MyPLAYER · T{view.seasonNumber} · Sem. {view.week}
            </p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-5xl">
              {id.nome}
            </h1>
            <p className="mt-2 text-sm text-blue-100/85">
              {id.posicao}
              {id.idade != null ? ` · ${id.idade} anos` : ''}
              {id.teamName ? ` · ${id.teamName}` : ''}
              {id.arquetipoTagline ? ` · ${id.arquetipoTagline}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="neutral">POT {id.potencial}</Badge>
              {id.popularidade != null && (
                <Badge tone="neutral">Pop. {id.popularidade}</Badge>
              )}
              {!view.injury.healthy && (
                <Badge tone="danger">Lesionado</Badge>
              )}
              {view.careerStats.legacy && (
                <Badge tone="blue">
                  Legado {view.careerStats.legacy.tierLabel}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-center lg:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
              Overall
            </p>
            <p className="font-display text-7xl font-black leading-none text-amber-300 sm:text-8xl">
              {id.overall}
            </p>
            {view.careerStats.progression && (
              <p className="mt-2 text-xs text-blue-100/70">
                Nível {view.careerStats.progression.level} · XP{' '}
                {view.careerStats.progression.xp}
                {view.careerStats.progression.xpToNext
                  ? `/${view.careerStats.progression.xpToNext}`
                  : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Coluna esquerda — atributos / tendências / personalidade / DNA */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <Panel title="Atributos" eyebrow={view.sources.charts}>
            <RadarChart data={view.charts.radar} />
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {view.charts.radar.map((r) => (
                <li key={r.label} className="flex justify-between text-slate-600">
                  <span>{r.label}</span>
                  <span className="font-semibold text-navy">{r.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tendências" eyebrow={view.sources.tendencies}>
            <BarChart data={view.charts.tendencies} />
          </Panel>

          <Panel title="Personalidade" eyebrow={view.sources.personality}>
            <ul className="space-y-2">
              {view.personality.map((t) => (
                <li key={t.key}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{t.label}</span>
                    <span className="font-semibold text-navy">{t.value}</span>
                  </div>
                  <ProgressBar
                    className="mt-1"
                    value={t.value}
                    max={100}
                    height="h-1.5"
                  />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="DNA" eyebrow={view.sources.dna}>
            {view.dna.summary && (
              <p className="mb-2 text-xs text-slate-600">{view.dna.summary}</p>
            )}
            {view.dna.dominant?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {view.dna.dominant.map((d) => (
                  <Badge key={d.key} tone="blue">
                    {d.label} {d.value}
                  </Badge>
                ))}
              </div>
            )}
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-slate-600">
              {(view.dna.traits ?? []).slice(0, 12).map((t) => (
                <li key={t.key} className="flex justify-between">
                  <span>{t.label}</span>
                  <span className="font-semibold text-navy">{t.value}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Centro — badges, conquistas, stats, gráficos */}
        <div className="flex flex-col gap-4 xl:col-span-5">
          <Panel title="Badges" eyebrow={view.sources.badges}>
            <p className="mb-2 text-[11px] text-slate-400">{view.badges.note}</p>
            {view.badges.items.length === 0 ? (
              <Empty>Nenhuma conquista desbloqueada ainda.</Empty>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {view.badges.items.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-amber-200/60 bg-amber-50/50 px-2 py-2"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80">
                      {b.categoryLabel}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-navy">{b.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Conquistas" eyebrow={view.sources.achievements}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {view.achievements.unlockedCount}/{view.achievements.total}
              </p>
              <Badge tone="blue">{view.achievements.percent}%</Badge>
            </div>
            <ProgressBar
              value={view.achievements.percent}
              max={100}
              className="mb-3"
            />
            {view.achievements.inProgress?.length > 0 && (
              <ul className="space-y-2">
                {view.achievements.inProgress.map((a) => (
                  <li key={a.id} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-navy">{a.name}</span>
                      <span className="text-slate-400">{a.percent}%</span>
                    </div>
                    <ProgressBar
                      className="mt-1"
                      value={a.percent}
                      max={100}
                      height="h-1"
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Estatísticas da carreira" eyebrow={view.sources.stats}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat
                label="Semanas"
                value={view.careerStats.meta?.weeksPlayed ?? 0}
              />
              <Stat
                label="Pico OVR"
                value={view.careerStats.meta?.peakOverall ?? id.overall}
              />
              <Stat
                label="XP total"
                value={view.careerStats.meta?.totalXpEarned ?? 0}
              />
            </div>
            {av ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Stat label="Jogos" value={av.games} />
                <Stat label="PER" value={av.averages?.per ?? '—'} />
                <Stat label="TS%" value={av.averages?.tsPct ?? '—'} />
                <Stat label="WS" value={av.averages?.winShares ?? '—'} />
                <Stat label="PTS" value={av.counting?.pts ?? 0} />
                <Stat label="REB" value={av.counting?.reb ?? 0} />
                <Stat label="AST" value={av.counting?.ast ?? 0} />
                <Stat label="STL" value={av.counting?.stl ?? 0} />
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">
                Sem box score avançado ainda — jogue partidas na temporada.
              </p>
            )}
          </Panel>

          <Panel title="Gráficos de evolução" eyebrow={view.sources.charts}>
            <p className="mb-2 text-[11px] text-slate-400">
              XP acumulado nas semanas (Save history) · pico vs overall atual
            </p>
            {view.charts.evolution.xp?.length > 0 ? (
              <LineChart data={view.charts.evolution.xp} />
            ) : (
              <Empty>Avance semanas para gerar a curva de XP.</Empty>
            )}
            <div className="mt-3">
              <BarChart data={view.charts.evolution.overallMarkers} />
            </div>
          </Panel>
        </div>

        {/* Direita — contrato, lesões, prêmios, histórico, timeline */}
        <div className="flex flex-col gap-4 xl:col-span-3">
          <Panel title="Contratos" eyebrow={view.sources.contract}>
            {view.contract.contract ? (
              <>
                <p className="font-display text-xl font-bold text-navy">
                  {formatMoney(view.contract.contract.yearlySalary)}/ano
                </p>
                <p className="text-xs text-slate-500">
                  {view.contract.contract.yearsRemaining} ano(s) ·{' '}
                  {view.contract.contract.freeAgencyLabel ??
                    view.contract.contract.teamName ??
                    '—'}
                </p>
                {view.contract.contract.tradeClauseLabel && (
                  <p className="mt-1 text-xs text-slate-400">
                    {view.contract.contract.tradeClauseLabel}
                  </p>
                )}
              </>
            ) : (
              <Empty>Sem contrato ativo.</Empty>
            )}
            {view.contract.pendingOffer && (
              <p className="mt-2 text-xs text-amber-700">
                Oferta pendente: {view.contract.pendingOffer.typeLabel}
              </p>
            )}
          </Panel>

          <Panel title="Lesões" eyebrow={view.sources.injury}>
            {view.injury.healthy ? (
              <Badge tone="blue">Saudável</Badge>
            ) : (
              <div>
                <Badge tone="danger">{view.injury.active?.severityLabel}</Badge>
                <p className="mt-2 font-semibold text-navy">
                  {view.injury.active?.label}
                </p>
                <p className="text-xs text-slate-500">
                  {view.injury.active?.weeksRemaining} semana(s) restantes
                </p>
              </div>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Risco {view.injury.profile?.injuryRisk ?? '—'} · condição{' '}
              {view.injury.profile?.condition ?? '—'}
            </p>
            {view.injury.history?.length > 0 && (
              <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-slate-500">
                {view.injury.history.map((h, i) => (
                  <li key={i}>
                    {h.label ?? h.type} · {h.severityLabel}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Prêmios" eyebrow={view.sources.awards}>
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Badge tone="neutral">
                Game MVP {view.awards.gameMvpCount}
              </Badge>
              <Badge tone="neutral">
                TD {view.awards.tripleDoubleCount}
              </Badge>
            </div>
            {view.awards.awards?.length === 0 &&
            view.awards.mvps?.length === 0 ? (
              <Empty>Sem prêmios arquivados ainda.</Empty>
            ) : (
              <ul className="space-y-1 text-xs text-slate-600">
                {view.awards.mvps.map((m, i) => (
                  <li key={`mvp-${i}`}>
                    MVP T{m.season ?? '—'} · {m.teamShort ?? m.teamId}
                  </li>
                ))}
                {view.awards.awards.map((a, i) => (
                  <li key={`aw-${i}`}>
                    {a.label ?? a.type} · T{a.season ?? '—'}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Histórico" eyebrow={view.sources.timeline}>
            <p className="text-xs text-slate-500">
              {view.historico.weeksPlayed} semana(s) jogadas
            </p>
            <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-slate-600">
              {view.historico.weekLog.map((h, i) => (
                <li key={i}>
                  T{h.season} S{h.week}
                  {h.activityLabel ? ` · ${h.activityLabel}` : ''}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Timeline da carreira" eyebrow={view.sources.timeline}>
            {view.timeline.length === 0 ? (
              <Empty>Timeline vazia — avance a carreira.</Empty>
            ) : (
              <ol className="max-h-80 space-y-2 overflow-y-auto">
                {view.timeline.map((item) => (
                  <li
                    key={item.id}
                    className="border-l-2 border-slate-200 pl-3 text-xs"
                  >
                    <Badge tone={TIMELINE_TONE[item.kind] ?? 'neutral'}>
                      {item.kind}
                    </Badge>
                    <p className="mt-1 font-semibold text-navy">{item.title}</p>
                    {item.detail && (
                      <p className="text-slate-500">{item.detail}</p>
                    )}
                    {(item.season != null || item.week != null) && (
                      <p className="text-[10px] text-slate-400">
                        T{item.season} · Sem. {item.week}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          to="/franchise"
          className="text-sm font-bold text-accent no-underline hover:underline"
        >
          Franquia
        </Link>
        <Link
          to="/"
          className="text-sm font-bold text-accent no-underline hover:underline"
        >
          Voltar ao hub
        </Link>
      </div>
    </div>
  )
}

function Panel({ title, eyebrow, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
      <header className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {eyebrow}
        </p>
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
          {title}
        </h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-ice px-2 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-bold text-navy">{value}</p>
    </div>
  )
}

function Empty({ children }) {
  return <p className="text-xs text-slate-400">{children}</p>
}

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}
