/**
 * Interface — tela completa da franquia.
 * Só renderiza o DTO da Franchise Hub Engine.
 */

import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

export default function FranchiseHubPanel() {
  const navigate = useNavigate()
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const finance = useGameStore((s) => s.finance)
  const status = useGameStore((s) => s.status)
  const sponsorships = useGameStore((s) => s.sponsorships)
  const leagueHistory = useGameStore((s) => s.leagueHistory)
  const dynasty = useGameStore((s) => s.dynasty)
  const relationshipEffects = useGameStore((s) => s.relationshipEffects)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const lastWeekResult = useGameStore((s) => s.lastWeekResult)
  const weekEffects = useGameStore((s) => s.weekEffects)

  const view = useMemo(
    () =>
      gameService.getFranchiseHubView({
        gm,
        season,
        finance,
        status,
        sponsorships,
        leagueHistory,
        dynasty,
        relationshipEffects,
        currentTeamId,
        currentWeek,
        currentSeason,
        lastWeekResult,
        weekEffects,
      }),
    [
      gm,
      season,
      finance,
      status,
      sponsorships,
      leagueHistory,
      dynasty,
      relationshipEffects,
      currentTeamId,
      currentWeek,
      currentSeason,
      lastWeekResult,
      weekEffects,
    ],
  )

  if (!view.available) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Franquia
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy">
          Franquia indisponível
        </h2>
        <p className="mt-2 text-sm text-slate-500">{view.message}</p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Voltar ao hub
        </Button>
      </Card>
    )
  }

  const { team, situation, salaryCap, objectives } = view

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Hero da franquia */}
      <section className="relative overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-br from-[#0c1a2e] via-[#163556] to-[#1f4a6e] p-5 text-white shadow-xl sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 0%, rgba(250,204,21,0.16), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(56,189,248,0.12), transparent 45%)',
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
              Franquia · Sem. {view.week} · T{view.seasonNumber}
            </p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl">
              {team.name}
            </h1>
            <p className="mt-2 text-sm text-blue-100/85">
              {team.short}
              {team.conference ? ` · ${team.conference}` : ''}
              {team.city ? ` · ${team.city}` : ''} ·{' '}
              {view.record.wins}-{view.record.losses}
              {view.record.streakLabel
                ? ` · ${view.record.streakLabel}`
                : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="warning">{objectives.current.label}</Badge>
              <Badge tone="neutral">Modo {situation.mode}</Badge>
              <Badge tone="blue">OVR {situation.avgOvr}</Badge>
              {situation.needs?.map((pos) => (
                <Badge key={pos} tone="danger">
                  Precisa {pos}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/free-agency')}
            >
              Free Agency
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/draft-night')}
            >
              Draft Night
            </Button>
          </div>
        </div>
      </section>

      {/* Cap + Objetivo + GM */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Salary Cap" eyebrow={view.sources.salaryCap}>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label="Folha" value={salaryCap.payrollLabel} />
            <Stat label="Espaço" value={salaryCap.spaceLabel} />
          </div>
          <ProgressBar
            className="mt-3"
            value={Math.min(100, salaryCap.usagePct)}
            max={100}
          />
          <p className="mt-2 text-xs text-slate-500">
            Uso {salaryCap.usagePct}%
            {salaryCap.overCap ? ' · acima do teto' : ''}
            {salaryCap.underFloor ? ' · abaixo do floor' : ''}
          </p>
        </Panel>

        <Panel title="Objetivos da franquia" eyebrow={view.sources.objectives}>
          <p className="font-display text-lg font-bold text-navy">
            {objectives.current.label}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {objectives.current.reason}
          </p>
          {objectives.candidates?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {objectives.candidates.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between text-xs text-slate-500"
                >
                  <span
                    className={
                      c.id === objectives.current.id
                        ? 'font-bold text-navy'
                        : ''
                    }
                  >
                    {c.label ?? c.id}
                  </span>
                  <span className="tabular-nums">{Math.round(c.score)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="GM" eyebrow={view.sources.gm}>
          <p className="font-display text-lg font-bold text-navy">
            {view.gm.personalityLabel ?? '—'}
          </p>
          {view.gm.personalityDescription && (
            <p className="mt-1 text-xs text-slate-500">
              {view.gm.personalityDescription}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="neutral">FA {view.gm.freeAgentsCount}</Badge>
            <Badge tone="neutral">
              Draft {view.gm.draftComplete ? 'ok' : view.gm.draftRemaining}
            </Badge>
          </div>
          {view.gm.lastWeekDecisions?.length > 0 ? (
            <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
              {view.gm.lastWeekDecisions.map((d, i) => (
                <li key={`${d.type}-${i}`}>
                  <span className="font-semibold uppercase text-navy">
                    {d.type}
                  </span>
                  {d.playerName ? ` · ${d.playerName}` : ''}
                  {d.reason ? ` — ${d.reason}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              Sem decisões do GM nesta semana.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Elenco + Contratos */}
        <div className="flex flex-col gap-4 xl:col-span-5">
          <Panel
            title="Elenco"
            eyebrow={`${view.roster.count} jogadores · ${view.sources.roster}`}
          >
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {view.roster.players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-navy">{p.nome}</p>
                    <p className="text-slate-500">
                      {p.posicao} · {p.idade}a · POT {p.potencial}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-navy">
                      {p.overall}
                    </p>
                    <p className="text-slate-400">
                      {p.yearsRemaining != null
                        ? `${p.yearsRemaining}a`
                        : '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Contratos" eyebrow={view.sources.contracts}>
            <p className="mb-2 text-xs text-slate-500">
              Total {view.contracts.totalLabel}
            </p>
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {view.contracts.rows.map((r) => (
                <li
                  key={r.playerId}
                  className="flex justify-between gap-2 text-xs"
                >
                  <span className="font-semibold text-navy">
                    {r.playerName}{' '}
                    <span className="font-normal text-slate-400">
                      {r.posicao}
                    </span>
                  </span>
                  <span className="tabular-nums text-slate-600">
                    {r.salaryLabel} · {r.yearsRemaining}a
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Química + Rotação + Coach */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <Panel title="Química" eyebrow={view.sources.chemistry}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl font-black text-navy">
                  {view.chemistry.teamChemistry}
                </p>
                <p className="text-xs text-slate-500">Química do elenco</p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>Passe +{view.chemistry.passBoost}</p>
                <p>Mov. +{view.chemistry.movementBoost}</p>
                <p>Def. +{view.chemistry.defenseBoost}</p>
              </div>
            </div>
            <ProgressBar
              className="mt-3"
              value={view.chemistry.teamChemistry}
              max={100}
            />
            {view.chemistry.bestPairs?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                {view.chemistry.bestPairs.slice(0, 3).map((pair) => (
                  <li key={pair.key}>
                    {pair.aName} / {pair.bName}{' '}
                    <span className="text-accent">+{pair.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Rotação" eyebrow={view.sources.rotation}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Titulares
            </p>
            <ul className="mt-2 space-y-1.5">
              {view.rotation.starters.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between text-xs"
                >
                  <span className="font-semibold text-navy">
                    {p.posicao} · {p.nome}
                  </span>
                  <span className="text-slate-500">{p.overall}</span>
                </li>
              ))}
            </ul>
            {(view.rotation.minutesTarget != null ||
              view.rotation.styleLabel) && (
              <p className="mt-3 text-xs text-slate-500">
                {view.rotation.styleLabel
                  ? `Estilo ${view.rotation.styleLabel}`
                  : ''}
                {view.rotation.minutesTarget != null
                  ? ` · minutos alvo ${view.rotation.minutesTarget}`
                  : ''}
              </p>
            )}
            {view.rotation.playbook?.topPlays?.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Playbook ({view.rotation.playbook.playCount})
                </p>
                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  {view.rotation.playbook.topPlays.slice(0, 4).map((pl) => (
                    <li key={pl.id}>
                      {pl.name}{' '}
                      <span className="text-slate-400">
                        · {pl.categoryLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel title="Coach" eyebrow={view.sources.coach}>
            {view.coach.coach ? (
              <>
                <p className="font-display text-lg font-bold text-navy">
                  {view.coach.coach.name}
                </p>
                <p className="text-xs text-slate-500">
                  {view.coach.coach.preferredStyleLabel}
                </p>
                {view.coach.decision && (
                  <p className="mt-2 text-xs text-slate-600">
                    Foco: {view.coach.decision.practiceFocus ?? '—'}
                    {view.coach.decision.minutes != null
                      ? ` · ${view.coach.decision.minutes} min`
                      : ''}
                  </p>
                )}
                <ul className="mt-3 grid grid-cols-2 gap-1">
                  {view.coach.attributes.slice(0, 6).map((a) => (
                    <li key={a.id} className="text-[11px] text-slate-500">
                      {a.label}{' '}
                      <span className="font-semibold text-navy">{a.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-slate-400">Sem coach atribuído.</p>
            )}
          </Panel>
        </div>

        {/* Draft + Patrimônio + Histórico */}
        <div className="flex flex-col gap-4 xl:col-span-3">
          <Panel title="Escolhas de Draft" eyebrow={view.sources.draftPicks}>
            {view.draftPicks.picks?.length ? (
              <ul className="space-y-1.5 text-xs">
                {view.draftPicks.picks.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between gap-2"
                  >
                    <span className="font-semibold text-navy">
                      {p.label}
                      {p.traded ? (
                        <span className="ml-1 text-amber-600">(via trade)</span>
                      ) : null}
                    </span>
                    <span className="text-slate-500">
                      {p.originalShort} · val {p.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                Nenhuma pick sob controle da franquia.
              </p>
            )}
            {view.draftPicks.lastDraft?.teamPicks?.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Último draft
                </p>
                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  {view.draftPicks.lastDraft.teamPicks.map((p) => (
                    <li key={p.pickNumber}>
                      #{p.pickNumber} {p.prospectName} ({p.posicao})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          <Panel title="Patrimônio" eyebrow={view.sources.patrimonio}>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                label="Seu patrimônio"
                value={view.patrimonio.playerPatrimonioLabel}
              />
              <Stat label="Caixa" value={view.patrimonio.cashLabel} />
              <Stat
                label="Folha franquia"
                value={view.patrimonio.franchisePayrollLabel}
              />
              <Stat
                label="Espaço cap"
                value={view.patrimonio.franchiseSpaceLabel}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {view.patrimonio.sponsorships} patrocínio(s)
              {view.patrimonio.sponsorIncomeWeekly
                ? ` · ${view.patrimonio.sponsorIncomeLabel}/sem`
                : ''}
              {view.patrimonio.investments
                ? ` · ${view.patrimonio.investments} investimento(s)`
                : ''}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {view.patrimonio.note}
            </p>
          </Panel>

          <Panel title="Histórico" eyebrow={view.sources.historico}>
            {view.historico.dynasty && (
              <Badge tone="warning" className="mb-2">
                Dinastia {view.historico.dynasty.label}
              </Badge>
            )}
            <p className="text-xs text-slate-500">
              Reputação {view.historico.reputation}
              {view.historico.seasonsArchived
                ? ` · ${view.historico.seasonsArchived} temporada(s) no arquivo`
                : ''}
            </p>
            {view.historico.champions?.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {view.historico.champions.map((c, i) => (
                  <li key={i}>
                    Título T{c.season ?? c.seasonNumber ?? '—'}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                Sem títulos arquivados nesta franquia.
              </p>
            )}
            {view.historico.awards?.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                {view.historico.awards.map((a, i) => (
                  <li key={i}>
                    {a.label ?? a.type} · T{a.season ?? '—'}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          to="/nba-tv"
          className="text-sm font-bold text-accent no-underline hover:underline"
        >
          NBA TV
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
