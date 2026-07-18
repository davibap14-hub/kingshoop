/**
 * Interface — Free Agency.
 * Só renderiza o DTO da Free Agency Engine e dispara ações via store.
 * Negociação = Contract Engine (sem lógica de mercado na UI).
 */

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FA_DEFAULT_FILTERS, FA_POSITIONS } from '../../data/freeAgency'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

const INTEREST_TONE = {
  hot: 'danger',
  warm: 'warning',
  cold: 'neutral',
  none: 'neutral',
}

export default function FreeAgencyPanel() {
  const navigate = useNavigate()
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const newsFeed = useGameStore((s) => s.newsFeed)
  const weekNews = useGameStore((s) => s.weekNews)
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const lastEvent = useGameStore((s) => s.lastEvent)

  const createFaOffer = useGameStore((s) => s.createFaOffer)
  const negotiateFaOffer = useGameStore((s) => s.negotiateFaOffer)
  const acceptFaOffer = useGameStore((s) => s.acceptFaOffer)
  const withdrawFaOffer = useGameStore((s) => s.withdrawFaOffer)

  const [filters, setFilters] = useState({ ...FA_DEFAULT_FILTERS })
  const [selectedId, setSelectedId] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const [terms, setTerms] = useState(null)

  const careerState = {
    gm,
    season,
    currentTeamId,
    currentWeek,
    currentSeason,
    newsFeed,
    weekNews,
    leagueHistory,
  }

  const view = useMemo(
    () =>
      gameService.getFreeAgencyView(careerState, {
        ...filters,
        selectedId,
        compareIds,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional board refresh on gm/filters
    [
      gm,
      season,
      currentTeamId,
      currentWeek,
      currentSeason,
      newsFeed,
      weekNews,
      leagueHistory,
      filters,
      selectedId,
      compareIds,
    ],
  )

  if (!view.available) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Free Agency
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy">
          Mercado indisponível
        </h2>
        <p className="mt-2 text-sm text-slate-500">{view.message}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Voltar ao hub
        </Button>
      </Card>
    )
  }

  const selected = view.selected
  const pending = view.pendingOffer

  const openNegotiate = () => {
    if (!pending) return
    setTerms({
      yearlySalary: pending.yearlySalary,
      years: pending.years,
      signingBonus: pending.signingBonus ?? 0,
      tradeClause: pending.clauses?.tradeClause ?? 'none',
      playerOption: Boolean(pending.options?.playerOption),
      teamOption: Boolean(pending.options?.teamOption),
    })
  }

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--ds-hero-from)] via-[var(--ds-hero-via)] to-[var(--ds-hero-to)] p-5 text-white shadow-hero sm:p-6 animate-rise">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 10% 0%, rgba(250,204,21,0.18), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(56,189,248,0.12), transparent 45%)',
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
              Free Agency · Contract Engine
            </p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight">
              Mercado de agentes livres
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100/85">
              {view.teamShort ?? 'Franquia'} no mercado · {view.freeAgentsTotal}{' '}
              FA(s) na liga · {view.message}
            </p>
            {view.needs?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {view.needs.map((pos) => (
                  <Badge key={pos} tone="warning">
                    Precisa {pos}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-right text-xs text-blue-100/70">
            <p>Semana {currentWeek} · T{currentSeason}</p>
            {view.cap && (
              <p className="mt-1">
                Cap {view.cap.usagePct ?? '—'}% · espaço{' '}
                {formatMoney(view.cap.space)}
              </p>
            )}
          </div>
        </div>
      </section>

      {lastEvent && (
        <p className="text-xs font-medium text-slate-500">{lastEvent}</p>
      )}

      {/* Filtros */}
      <Card padding="md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Filtros
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-500">
            Posição
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-navy"
              value={filters.position}
              onChange={(e) =>
                setFilters((f) => ({ ...f, position: e.target.value }))
              }
            >
              <option value="ALL">Todas</option>
              {FA_POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <RangeField
            label="Idade"
            min={filters.ageMin}
            max={filters.ageMax}
            lo={18}
            hi={42}
            onMin={(v) => setFilters((f) => ({ ...f, ageMin: v }))}
            onMax={(v) => setFilters((f) => ({ ...f, ageMax: v }))}
          />
          <RangeField
            label="Overall"
            min={filters.ovrMin}
            max={filters.ovrMax}
            lo={60}
            hi={99}
            onMin={(v) => setFilters((f) => ({ ...f, ovrMin: v }))}
            onMax={(v) => setFilters((f) => ({ ...f, ovrMax: v }))}
          />
          <RangeField
            label="Salário pedido ($M)"
            min={Math.round(filters.salaryMin / 1_000_000)}
            max={Math.round(filters.salaryMax / 1_000_000)}
            lo={0}
            hi={60}
            onMin={(v) =>
              setFilters((f) => ({ ...f, salaryMin: v * 1_000_000 }))
            }
            onMax={(v) =>
              setFilters((f) => ({ ...f, salaryMax: v * 1_000_000 }))
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar nome…"
            value={filters.query}
            onChange={(e) =>
              setFilters((f) => ({ ...f, query: e.target.value }))
            }
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ ...FA_DEFAULT_FILTERS })}
          >
            Limpar
          </Button>
        </div>
      </Card>

      {/* Oferta pendente */}
      {pending && (
        <Card padding="md" className="border-amber-300/60 bg-amber-50/50">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge tone="warning">Oferta pendente · Contract Engine</Badge>
              <p className="mt-2 font-display text-lg font-bold text-navy">
                {pending.typeLabel} · {pending.fromTeamShort}
              </p>
              <p className="text-sm text-slate-600">{pending.reason}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span>{formatMoney(pending.yearlySalary)}/ano</span>
                <span>{pending.years} ano(s)</span>
                <span>Bônus {formatMoney(pending.signingBonus)}</span>
                <span>{pending.tradeClauseLabel}</span>
                <span>
                  Rodada {pending.negotiateRound}/{pending.maxNegotiateRounds}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="accent" onClick={() => acceptFaOffer()}>
                Confirmar assinatura
              </Button>
              <Button size="sm" variant="secondary" onClick={openNegotiate}>
                Negociar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => withdrawFaOffer()}
              >
                Retirar
              </Button>
            </div>
          </div>
          {terms && (
            <NegotiateForm
              terms={terms}
              setTerms={setTerms}
              onSubmit={() => {
                negotiateFaOffer(terms)
                setTerms(null)
              }}
              onCancel={() => setTerms(null)}
            />
          )}
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Lista */}
        <div className="xl:col-span-5">
          <Panel title="Jogadores livres" eyebrow={`${view.agents.length} no filtro`}>
            {view.agents.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum FA com esses filtros.</p>
            ) : (
              <ul className="max-h-[640px] space-y-1 overflow-y-auto">
                {view.agents.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={[
                        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition',
                        selected?.id === a.id
                          ? 'bg-navy text-white'
                          : 'hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <div className="min-w-0">
                        <p
                          className={[
                            'truncate font-semibold',
                            selected?.id === a.id ? 'text-white' : 'text-navy',
                          ].join(' ')}
                        >
                          {a.nome}
                          {a.fitsNeed ? ' ·' : ''}
                        </p>
                        <p
                          className={[
                            'text-[11px]',
                            selected?.id === a.id
                              ? 'text-blue-100/80'
                              : 'text-slate-500',
                          ].join(' ')}
                        >
                          {a.posicao} · {a.idade}a · OVR {a.overall} · POT{' '}
                          {a.potencial}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={[
                            'text-xs font-bold',
                            selected?.id === a.id
                              ? 'text-amber-300'
                              : 'text-slate-700',
                          ].join(' ')}
                        >
                          {a.askedSalaryLabel}
                        </p>
                        <p
                          className={[
                            'text-[10px] uppercase',
                            selected?.id === a.id
                              ? 'text-blue-100/70'
                              : 'text-slate-400',
                          ].join(' ')}
                        >
                          Int. {a.teamInterest}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Detalhe */}
        <div className="flex flex-col gap-4 xl:col-span-7">
          {!selected ? (
            <Card padding="lg">
              <p className="text-sm text-slate-500">Selecione um free agent.</p>
            </Card>
          ) : (
            <>
              <Card padding="md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Perfil
                    </p>
                    <h2 className="font-display text-2xl font-black text-navy">
                      {selected.nome}
                    </h2>
                    <p className="text-sm text-slate-500">{selected.headline}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleCompare(selected.id)}
                    >
                      {compareIds.includes(selected.id)
                        ? 'Remover comparação'
                        : 'Comparar'}
                    </Button>
                    <Button
                      size="sm"
                      disabled={Boolean(pending)}
                      onClick={() => createFaOffer(selected.id)}
                    >
                      Fazer oferta
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <Stat label="Idade" value={selected.idade} />
                  <Stat label="OVR" value={selected.overall} />
                  <Stat label="POT" value={selected.potencial} />
                  <Stat label="Pop." value={selected.popularidade} />
                  <Stat label="Pedido" value={selected.askedSalaryLabel} />
                  <Stat label="Interesse" value={selected.teamInterest} />
                </div>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Interesse das franquias" eyebrow="Franchise AI">
                  <ul className="space-y-2">
                    {selected.franchiseInterest.map((row) => (
                      <li key={row.teamId}>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-navy">
                            {row.teamShort}
                            {row.isPlayerTeam ? ' (você)' : ''}
                          </span>
                          <Badge tone={INTEREST_TONE[row.level] ?? 'neutral'}>
                            {row.interest}
                          </Badge>
                        </div>
                        <ProgressBar
                          className="mt-1"
                          value={row.interest}
                          max={100}
                        />
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {row.blurb}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel title="Rumores" eyebrow="Tempo real">
                  <RumorList items={selected.rumors} />
                </Panel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Histórico" eyebrow="History · GM">
                  <HistoryBlock history={selected.history} />
                </Panel>
                <Panel title="Comparação" eyebrow="Lado a lado">
                  {view.comparison ? (
                    <ComparisonBlock comparison={view.comparison} />
                  ) : (
                    <p className="text-xs text-slate-400">
                      Selecione dois FAs com “Comparar” (máx. 2).
                      {compareIds.length === 1
                        ? ` Um escolhido — falta o segundo.`
                        : ''}
                    </p>
                  )}
                </Panel>
              </div>
            </>
          )}
        </div>
      </div>

      {view.marketRumors?.length > 0 && (
        <Panel title="Fio do mercado" eyebrow="Liga">
          <RumorList items={view.marketRumors} />
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

function NegotiateForm({ terms, setTerms, onSubmit, onCancel }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
        Negociar (Contract Engine)
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <label className="text-xs text-slate-500">
          Salário anual
          <input
            type="number"
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
            value={terms.yearlySalary}
            onChange={(e) =>
              setTerms((t) => ({
                ...t,
                yearlySalary: Number(e.target.value),
              }))
            }
          />
        </label>
        <label className="text-xs text-slate-500">
          Anos
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
            value={terms.years}
            onChange={(e) =>
              setTerms((t) => ({ ...t, years: Number(e.target.value) }))
            }
          />
        </label>
        <label className="text-xs text-slate-500">
          Bônus
          <input
            type="number"
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
            value={terms.signingBonus}
            onChange={(e) =>
              setTerms((t) => ({
                ...t,
                signingBonus: Number(e.target.value),
              }))
            }
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onSubmit}>
          Enviar contra-proposta
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function Panel({ title, eyebrow, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-lift backdrop-blur-xl transition-all duration-300 hover:shadow-lift-lg">
      <header className="border-b border-[var(--ds-line)] bg-white/50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ds-muted)]">
          {eyebrow}
        </p>
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
          {title}
        </h2>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-ice px-2 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-bold text-navy">{value}</p>
    </div>
  )
}

function RangeField({ label, min, max, lo, hi, onMin, onMax }) {
  return (
    <div className="text-xs text-slate-500">
      <p>
        {label}{' '}
        <span className="font-semibold text-navy">
          {min}–{max}
        </span>
      </p>
      <div className="mt-1 flex gap-2">
        <input
          type="number"
          min={lo}
          max={hi}
          value={min}
          onChange={(e) => onMin(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          min={lo}
          max={hi}
          value={max}
          onChange={(e) => onMax(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  )
}

function RumorList({ items = [] }) {
  if (!items.length) {
    return <p className="text-xs text-slate-400">Sem rumores.</p>
  }
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto">
      {items.map((n) => (
        <li
          key={n.id}
          className={[
            'rounded-md border-l-2 px-2 py-1.5 text-xs',
            n.tone === 'signing'
              ? 'border-l-accent bg-accent-soft/40'
              : n.tone === 'home'
                ? 'border-l-amber-400 bg-amber-50'
                : n.tone === 'heat'
                  ? 'border-l-red-400 bg-red-50'
                  : 'border-l-slate-300 bg-slate-50',
          ].join(' ')}
        >
          <p className="font-semibold text-navy">{n.headline}</p>
          <p className="text-slate-500">{n.detail}</p>
        </li>
      ))}
    </ul>
  )
}

function HistoryBlock({ history }) {
  if (!history || history.empty) {
    return (
      <p className="text-xs text-slate-400">
        Sem histórico arquivado ainda para este nome.
      </p>
    )
  }
  return (
    <div className="space-y-3 text-xs">
      {history.career && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <MiniStat label="PTS" value={history.career.points} />
          <MiniStat label="REB" value={history.career.rebounds} />
          <MiniStat label="AST" value={history.career.assists} />
          <MiniStat label="GP" value={history.career.games} />
        </div>
      )}
      {history.moves?.length > 0 && (
        <ul className="space-y-1">
          {history.moves.map((m, i) => (
            <li key={`${m.type}-${m.at}-${i}`} className="text-slate-600">
              <span className="font-semibold uppercase text-navy">{m.type}</span>
              {' · '}
              {m.teamId?.toUpperCase()}
              {m.yearlySalary ? ` · ${formatMoney(m.yearlySalary)}` : ''}
            </li>
          ))}
        </ul>
      )}
      {history.seasons?.length > 0 && (
        <ul className="space-y-1 text-slate-500">
          {history.seasons.map((s) => (
            <li key={s.season}>
              T{s.season}:{' '}
              {s.highlights.map((h) => `${h.category} #${h.rank}`).join(' · ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ComparisonBlock({ comparison }) {
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">A</p>
          <p className="font-semibold text-navy">{comparison.a.nome}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">B</p>
          <p className="font-semibold text-navy">{comparison.b.nome}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {comparison.axes.map((axis) => (
          <li
            key={axis.key}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs"
          >
            <span
              className={
                axis.edge === 'a' ? 'font-bold text-accent' : 'text-slate-500'
              }
            >
              {formatAxis(axis.key, axis.a)}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {axis.label}
            </span>
            <span
              className={[
                'text-right',
                axis.edge === 'b' ? 'font-bold text-accent' : 'text-slate-500',
              ].join(' ')}
            >
              {formatAxis(axis.key, axis.b)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-medium text-slate-600">
        {comparison.verdict}
      </p>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded bg-ice px-1 py-1">
      <p className="text-[9px] font-bold uppercase text-slate-400">{label}</p>
      <p className="font-semibold text-navy">{value ?? '—'}</p>
    </div>
  )
}

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${n}`
}

function formatAxis(key, value) {
  if (key === 'salary') return formatMoney(value)
  return value
}
