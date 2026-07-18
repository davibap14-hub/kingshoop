/**
 * Interface — Match Center (pré-jogo).
 * Só renderiza o DTO da Match Center Engine. Sem cálculos.
 */

import { useNavigate } from 'react-router-dom'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import { useMatchStore } from '../../store/useMatchStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

export default function MatchCenterPanel() {
  const navigate = useNavigate()
  const season = useGameStore((s) => s.season)
  const gm = useGameStore((s) => s.gm)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const player = useGameStore((s) => s.player)
  const fatigue = useGameStore((s) => s.fatigue)

  const playFromMatchCenter = useMatchStore((s) => s.playFromMatchCenter)
  const isSimulating = useMatchStore((s) => s.isSimulating)

  const view = gameService.getMatchCenterView({
    season,
    gm,
    currentTeamId,
    currentWeek,
    currentSeason,
    player,
    fatigue,
  })

  if (!view.available) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Match Center
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy">
          Sem partida na fila
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {view.message ?? 'Avance a temporada para agendar o próximo confronto.'}
        </p>
        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => navigate('/')}
        >
          Voltar ao hub
        </Button>
      </Card>
    )
  }

  const { home, away, probability, rivalry, matchObjectives, referees } = view

  const playMatch = () => {
    playFromMatchCenter(home.team.id, away.team.id, gm)
    navigate('/live-match')
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header / logos */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--ds-hero-from)] via-[var(--ds-hero-via)] to-[var(--ds-hero-to)] p-6 text-white shadow-hero animate-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/90">
          Match Center · Semana {view.week} · T{view.seasonNumber}
        </p>
        <p className="mt-1 text-sm text-blue-100/80">{view.label}</p>
        <p className="mt-1 text-xs text-blue-100/60">
          {view.venue?.name} · {view.tipOff}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <TeamLogoBlock team={home.team} record={home.record} side="home" />
          <div className="text-center">
            <p className="font-display text-3xl font-black text-white/30">VS</p>
            <Badge tone="blue" className="mt-2 !bg-white/15 !text-white">
              {rivalry.label}
            </Badge>
          </div>
          <TeamLogoBlock team={away.team} record={away.record} side="away" />
        </div>
      </section>

      {/* Probabilidade */}
      <Card padding="lg">
        <SectionTitle eyebrow="Modelo pré-jogo" title="Probabilidade de vitória" />
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="font-display text-4xl font-extrabold text-navy">
            {probability.homeWinPct}%
          </p>
          <p className="font-display text-4xl font-extrabold text-navy">
            {probability.awayWinPct}%
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${probability.homeWinPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Força relativa {probability.homeStrength} vs {probability.awayStrength}{' '}
          (overall, record, mando, lesões e carga).
        </p>
      </Card>

      {/* Titulares */}
      <Card padding="lg">
        <SectionTitle eyebrow="Quintetos" title="Comparação dos titulares" />
        <ul className="mt-2 divide-y divide-slate-100">
          {view.startersComparison.map((row) => (
            <li
              key={row.position}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3"
            >
              <StarterCell player={row.home} align="left" edge={row.edge === 'home'} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {row.position}
              </span>
              <StarterCell player={row.away} align="right" edge={row.edge === 'away'} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Últimos resultados */}
        <Card padding="lg">
          <SectionTitle eyebrow="Forma" title="Últimos resultados" />
          <FormList label={home.team.short} games={home.form} />
          <FormList label={away.team.short} games={away.form} className="mt-4" />
          {view.headToHead?.length ? (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Confrontos diretos
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {view.headToHead.map((g) => (
                  <li key={g.gameId}>
                    S{g.week}: {g.homeShort} {g.homeScore}–{g.awayScore}{' '}
                    {g.awayShort}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        {/* Recordes */}
        <Card padding="lg">
          <SectionTitle eyebrow="Temporada" title="Recorde das equipes" />
          <RecordBlock team={home.team} record={home.record} />
          <RecordBlock team={away.team} record={away.record} className="mt-3" />
        </Card>
      </div>

      {/* Destaques */}
      <Card padding="lg">
        <SectionTitle eyebrow="Holofote" title="Jogador destaque" />
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <FeaturedCard side={home.team.short} player={home.featured} />
          <FeaturedCard side={away.team.short} player={away.featured} />
        </div>
      </Card>

      {/* Rivalidade + objetivos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <SectionTitle eyebrow="Clima" title="Rivalidades" />
          <p className="mt-1 font-display text-2xl font-extrabold text-navy">
            {rivalry.score}
            <span className="ml-2 text-sm font-semibold text-slate-400">
              / 100
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-600">{rivalry.label}</p>
          <ProgressBar value={rivalry.score} className="mt-3" />
        </Card>

        <Card padding="lg">
          <SectionTitle eyebrow="Missão" title="Objetivos da partida" />
          <ul className="mt-2 space-y-2">
            {matchObjectives.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-sm font-bold text-navy">{o.title}</p>
                <p className="text-[11px] text-slate-500">{o.detail}</p>
              </li>
            ))}
          </ul>
          {(home.objective || away.objective) && (
            <p className="mt-3 text-[11px] text-slate-400">
              Franquias:{' '}
              {home.objective
                ? `${home.team.short} · ${home.objective.label}`
                : null}
              {home.objective && away.objective ? ' · ' : ''}
              {away.objective
                ? `${away.team.short} · ${away.objective.label}`
                : null}
            </p>
          )}
        </Card>
      </div>

      {/* Condição física + lesões */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <SectionTitle eyebrow="Fadiga / físico" title="Condição do elenco" />
          <ConditionBlock team={home.team} condition={home.condition} />
          <ConditionBlock
            team={away.team}
            condition={away.condition}
            className="mt-3"
          />
        </Card>

        <Card padding="lg">
          <SectionTitle eyebrow="Medical" title="Lesões" />
          <InjuryList label={home.team.short} injuries={home.injuries} />
          <InjuryList
            label={away.team.short}
            injuries={away.injuries}
            className="mt-4"
          />
        </Card>
      </div>

      {/* Árbitros */}
      <Card padding="lg">
        <SectionTitle eyebrow="Arbitragem" title="Árbitros" />
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {referees.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
            >
              <Badge tone="neutral">{r.roleLabel}</Badge>
              <p className="mt-2 text-sm font-bold text-navy">{r.name}</p>
              <p className="text-[11px] font-semibold text-slate-500">
                {r.style}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{r.tendency}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* CTA */}
      <div className="sticky bottom-3 z-20">
        <Button
          variant="accent"
          size="lg"
          className="w-full !rounded-2xl !py-5 !text-base shadow-xl shadow-blue-900/30"
          onClick={playMatch}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulando…' : 'Jogar Partida'}
        </Button>
      </div>
    </div>
  )
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {eyebrow}
      </p>
      <h3 className="font-display text-xl font-extrabold text-navy">{title}</h3>
    </div>
  )
}

function TeamLogoBlock({ team, record, side }) {
  const primary = team?.colors?.primary ?? '#0c2340'
  const secondary = team?.colors?.secondary ?? '#ffffff'
  return (
    <div className={side === 'away' ? 'text-right' : 'text-left'}>
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 shadow-lg sm:h-24 sm:w-24"
        style={{
          backgroundColor: primary,
          borderColor: secondary,
          marginLeft: side === 'away' ? 'auto' : undefined,
          marginRight: side === 'home' ? 'auto' : undefined,
        }}
        title={team?.logo}
      >
        <span
          className="font-display text-2xl font-black tracking-tight sm:text-3xl"
          style={{ color: secondary }}
        >
          {team?.short}
        </span>
      </div>
      <p className="mt-3 font-display text-lg font-bold sm:text-xl">
        {team?.name}
      </p>
      <p className="text-sm text-blue-100/80">
        {record.wins}-{record.losses} · {record.streakLabel}
      </p>
    </div>
  )
}

function StarterCell({ player, align, edge }) {
  if (!player) {
    return (
      <span className={`text-xs text-slate-400 ${align === 'right' ? 'text-right' : ''}`}>
        —
      </span>
    )
  }
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p
        className={`text-sm font-bold ${edge ? 'text-navy' : 'text-slate-700'}`}
      >
        {player.name}
      </p>
      <p className="text-[11px] tabular-nums text-slate-400">
        OVR {player.overall}
      </p>
    </div>
  )
}

function FormList({ label, games, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {games?.length ? (
        <ul className="mt-1.5 space-y-1">
          {games.map((g) => (
            <li
              key={g.gameId}
              className="flex items-center justify-between text-sm"
            >
              <span
                className={
                  g.result === 'W'
                    ? 'font-bold text-emerald-600'
                    : 'font-bold text-rose-600'
                }
              >
                {g.result}
              </span>
              <span className="text-slate-600">{g.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Sem jogos recentes.</p>
      )}
    </div>
  )
}

function RecordBlock({ team, record, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-navy">{team.short}</p>
        <p className="font-display text-2xl font-extrabold tabular-nums text-navy">
          {record.wins}-{record.losses}
        </p>
      </div>
      <p className="text-xs text-slate-500">
        Aprov. {(record.winPct * 100).toFixed(0)}% · Seq. {record.streakLabel} ·
        PF {record.pointsFor} / PA {record.pointsAgainst}
      </p>
    </div>
  )
}

function FeaturedCard({ side, player }) {
  if (!player) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        Sem destaque para {side}.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {side}
      </p>
      <p className="mt-1 font-display text-xl font-extrabold text-navy">
        {player.name}
      </p>
      <p className="text-sm text-slate-500">
        {player.position} · OVR {player.overall}
      </p>
      <p className="mt-2 text-[11px] text-slate-500">{player.note}</p>
    </div>
  )
}

function ConditionBlock({ team, condition, className = '' }) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-bold text-navy">{team.short}</p>
        <Badge tone={condition.score >= 70 ? 'success' : condition.score >= 50 ? 'neutral' : 'warning'}>
          {condition.label}
        </Badge>
      </div>
      <ProgressBar value={condition.score} />
      <p className="mt-1 text-[11px] text-slate-500">
        {condition.fatigueLabel} · resistência média {condition.avgResistance} ·{' '}
        {condition.injuryCount} lesão(ões)
      </p>
    </div>
  )
}

function InjuryList({ label, injuries, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {injuries?.length ? (
        <ul className="mt-1.5 space-y-1.5">
          {injuries.map((i) => (
            <li
              key={i.id}
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900"
            >
              <span className="font-bold">{i.playerName}</span> — {i.label}
              {i.weeksRemaining != null
                ? ` · ${i.weeksRemaining} sem.`
                : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Nenhuma lesão reportada.</p>
      )}
    </div>
  )
}
