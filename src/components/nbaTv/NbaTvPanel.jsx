/**
 * Interface — NBA TV (portal de notícias).
 * Só renderiza o DTO da NBA TV Engine.
 * Nunca gera notícias nem recalcula rankings.
 */

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

const TONE = {
  positive: 'blue',
  negative: 'danger',
  neutral: 'neutral',
}

export default function NbaTvPanel() {
  const navigate = useNavigate()
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const analytics = useGameStore((s) => s.analytics)
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const records = useGameStore((s) => s.records)
  const weekNews = useGameStore((s) => s.weekNews)
  const newsFeed = useGameStore((s) => s.newsFeed)
  const player = useGameStore((s) => s.player)
  const playerName = useGameStore((s) => s.playerName)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)

  const [category, setCategory] = useState('ALL')

  const view = useMemo(
    () =>
      gameService.getNbaTvView(
        {
          gm,
          season,
          analytics,
          leagueHistory,
          records,
          weekNews,
          newsFeed,
          player,
          playerName,
          currentTeamId,
          currentWeek,
          currentSeason,
        },
        { category },
      ),
    [
      gm,
      season,
      analytics,
      leagueHistory,
      records,
      weekNews,
      newsFeed,
      player,
      playerName,
      currentTeamId,
      currentWeek,
      currentSeason,
      category,
    ],
  )

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* On-air header */}
      <section className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-[#0a1220] via-[#121f35] to-[#1a3352] p-5 text-white shadow-xl sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 0%, rgba(220,38,38,0.4), transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(56,189,248,0.15), transparent 45%)',
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                NBA TV
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
                Portal · Sem. {view.week} · T{view.seasonNumber}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              {view.headline?.title ?? 'Central de notícias da liga'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/85">
              {view.headline?.summary ?? view.message}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {view.sources.news} · {view.sources.history} ·{' '}
              {view.sources.analytics}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            Hub
          </Button>
        </div>
      </section>

      {/* Category filter — only filters DTO, no generation */}
      <div className="flex flex-wrap gap-1.5">
        {view.filters.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={[
              'rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition',
              category === c.id
                ? 'bg-navy text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Awards strip */}
      <div className="grid gap-3 md:grid-cols-2">
        <AwardCard
          eyebrow="Analytics Engine"
          award={view.playerOfTheWeek}
          empty="Sem Jogador da Semana — avance jogos na temporada."
        />
        <AwardCard
          eyebrow="News · Analytics"
          award={view.playerOfTheMonth}
          empty="Jogador do Mês em formação — precisa de destaques na janela."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Latest + Rumors */}
        <div className="flex flex-col gap-4 xl:col-span-5">
          <Panel title="Últimas notícias" eyebrow="News Engine">
            <NewsList items={view.latest} empty="Nenhuma manchete ainda." />
          </Panel>
          <Panel title="Rumores" eyebrow="News Engine">
            <NewsList items={view.rumors} empty="Fio de rumores quieto." />
          </Panel>
        </div>

        {/* Performances + Records + Rookies */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <Panel title="Top Performances" eyebrow="Analytics Engine">
            {view.topPerformances.length === 0 ? (
              <Empty>Sem performances avançadas nesta semana.</Empty>
            ) : (
              <ul className="space-y-2">
                {view.topPerformances.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-md bg-ice px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-navy">
                        #{p.rank} {p.playerName ?? p.title}
                      </span>
                      {p.per != null && (
                        <Badge tone="blue">PER {p.per}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-slate-500">{p.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recordes quebrados" eyebrow="Records · News">
            {view.recordsBroken.length === 0 && view.recordNews.length === 0 ? (
              <Empty>Nenhum recorde quebrado nesta semana.</Empty>
            ) : (
              <ul className="space-y-2">
                {view.recordsBroken.map((r) => (
                  <li key={r.id} className="text-xs">
                    <p className="font-semibold text-navy">{r.label}</p>
                    <p className="text-slate-500">
                      {r.holderName} · {r.value}
                      {r.note ? ` · ${r.note}` : ''}
                    </p>
                  </li>
                ))}
                {view.recordNews.map((n) => (
                  <li key={n.id} className="text-xs">
                    <Badge tone="warning">{n.categoryLabel}</Badge>
                    <p className="mt-1 font-semibold text-navy">{n.title}</p>
                    <p className="text-slate-500">{n.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Rookies" eyebrow="Draft · Analytics">
            {view.rookies.length === 0 ? (
              <Empty>Nenhum rookie no radar ainda.</Empty>
            ) : (
              <ul className="space-y-2">
                {view.rookies.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-navy">{r.playerName}</p>
                      <p className="text-slate-500">
                        {r.statusLabel} · {r.posicao} · POT {r.potencial}
                      </p>
                    </div>
                    <span className="font-mono text-slate-400">
                      {r.per != null ? `PER ${r.per}` : `OVR ${r.overall}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Power Ranking + Stats */}
        <div className="flex flex-col gap-4 xl:col-span-3">
          <Panel title="Power Ranking" eyebrow="Season Engine">
            {view.powerRanking.length === 0 ? (
              <Empty>Standings vazias — avance a temporada.</Empty>
            ) : (
              <ol className="space-y-1.5">
                {view.powerRanking.map((row) => (
                  <li key={row.teamId} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-navy">
                        <span className="mr-1.5 font-mono text-slate-400">
                          {row.rank}
                        </span>
                        {row.teamShort}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {row.wins}-{row.losses}
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-1"
                      value={Math.min(100, row.winPct * 100)}
                      max={100}
                      height="h-1"
                    />
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="Estatísticas" eyebrow="Analytics · History">
            <p className="mb-2 text-[10px] text-slate-400">{view.stats.tip}</p>
            {view.stats.leagueLeaders?.length ? (
              <ul className="space-y-1.5">
                {view.stats.leagueLeaders.slice(0, 8).map((l, i) => (
                  <li
                    key={l.playerId}
                    className="flex justify-between gap-2 text-xs"
                  >
                    <span className="font-semibold text-navy">
                      {i + 1}. {l.playerName}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      PER {l.per}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Sem líderes avançados ainda.</Empty>
            )}
            {view.stats.careerPlayer && (
              <div className="mt-3 rounded-md bg-ice px-2 py-2 text-xs">
                <p className="font-bold text-navy">
                  {view.stats.careerPlayer.playerName}
                </p>
                <p className="text-slate-500">
                  {view.stats.careerPlayer.games} jogos · PER{' '}
                  {view.stats.careerPlayer.averages?.per ?? '—'}
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* History spotlight */}
      {(view.historySpotlight.awards?.length > 0 ||
        view.historySpotlight.champions?.length > 0) && (
        <Panel title="Arquivo da liga" eyebrow="History Engine">
          <div className="grid gap-4 sm:grid-cols-3">
            <ArchiveCol
              label="Campeões"
              items={(view.historySpotlight.champions ?? []).map(
                (c) =>
                  `T${c.season ?? c.seasonNumber ?? '—'} · ${c.teamShort ?? c.teamId ?? c.name ?? '—'}`,
              )}
            />
            <ArchiveCol
              label="MVPs"
              items={(view.historySpotlight.mvps ?? []).map(
                (m) =>
                  `T${m.season ?? '—'} · ${m.playerName ?? m.name ?? m.teamId ?? '—'}`,
              )}
            />
            <ArchiveCol
              label="Prêmios"
              items={(view.historySpotlight.awards ?? []).map(
                (a) => `${a.label ?? a.type} · T${a.season ?? '—'}`,
              )}
            />
          </div>
        </Panel>
      )}

      <div className="flex justify-end">
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

function AwardCard({ eyebrow, award, empty }) {
  return (
    <Card padding="md" className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700/80">
        {eyebrow}
      </p>
      {award ? (
        <>
          <h2 className="mt-1 font-display text-xl font-black text-navy">
            {award.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{award.reason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="warning">{award.metric}</Badge>
            {award.value != null && (
              <Badge tone="neutral">{String(award.value)}</Badge>
            )}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      )}
    </Card>
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

function NewsList({ items, empty }) {
  if (!items?.length) return <Empty>{empty}</Empty>
  return (
    <ul className="max-h-[420px] space-y-2 overflow-y-auto">
      {items.map((n) => (
        <li
          key={n.id}
          className="rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={TONE[n.tone] ?? 'neutral'}>
              {n.categoryLabel}
            </Badge>
            {n.aboutPlayerTeam && <Badge tone="blue">Seu time</Badge>}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              T{n.seasonNumber} · Sem. {n.week}
            </span>
          </div>
          <p className="mt-1 font-display text-sm font-bold text-navy">
            {n.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">{n.summary}</p>
        </li>
      ))}
    </ul>
  )
}

function ArchiveCol({ label, items }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-slate-400">—</p>
      ) : (
        <ul className="mt-1 space-y-1 text-xs text-slate-600">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Empty({ children }) {
  return <p className="text-xs text-slate-400">{children}</p>
}
