/**
 * Interface — partida ao vivo.
 * Apenas reproduz frames da Live Match Engine (PBP da Simulation).
 * Nunca recalcula / re-simula a partida.
 */

import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LIVE_PLAYBACK_SPEEDS } from '../../data/liveMatch'
import { gameService } from '../../services/gameService'
import { useMatchStore } from '../../store/useMatchStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

export default function LiveMatchPanel() {
  const navigate = useNavigate()
  const lastMatch = useMatchStore((s) => s.lastMatch)
  const lastLiveFeed = useMatchStore((s) => s.lastLiveFeed)
  const setLiveFeed = useMatchStore((s) => s.setLiveFeed)

  const [speedId, setSpeedId] = useState('normal')
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [animKey, setAnimKey] = useState(0)
  const [matchKey, setMatchKey] = useState(null)

  // Garante feed a partir do lastMatch (Engine) — sem re-simular
  useEffect(() => {
    if (!lastMatch) return
    const key = lastMatch.summary ?? `${lastMatch.homeScore}-${lastMatch.awayScore}`
    if (matchKey === key && lastLiveFeed) return
    const built = gameService.buildLiveMatchFeed(lastMatch, { speed: speedId })
    if (built.ok) {
      setLiveFeed(built.feed)
      setMatchKey(key)
      setFrameIndex(0)
      setPlaying(true)
      setAnimKey((k) => k + 1)
    }
  }, [lastMatch, lastLiveFeed, matchKey, setLiveFeed, speedId])

  const feed = lastLiveFeed
  const frame = feed ? gameService.getLiveMatchFrame(feed, frameIndex) : null
  const done = Boolean(feed && frameIndex >= feed.frameCount - 1)

  const onTick = useEffectEvent(() => {
    if (!feed || !playing || done) return
    setFrameIndex((i) => Math.min(i + 1, feed.frameCount - 1))
    setAnimKey((k) => k + 1)
  })

  useEffect(() => {
    if (!frame || !playing || done) return undefined
    if (!frame.durationMs) {
      onTick()
      return undefined
    }
    const t = setTimeout(onTick, frame.durationMs)
    return () => clearTimeout(t)
  }, [frame, playing, done, frameIndex, onTick])

  const changeSpeed = (id) => {
    setSpeedId(id)
    if (!feed) return
    setLiveFeed(gameService.rescaleLiveFeedSpeed(feed, id))
  }

  if (!lastMatch) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Live Match
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy">
          Nenhuma partida para reproduzir
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Abra o Match Center e toque em Jogar Partida.
        </p>
        <Button className="mt-6" onClick={() => navigate('/match-center')}>
          Ir ao Match Center
        </Button>
      </Card>
    )
  }

  if (!feed || !frame) {
    return (
      <Card padding="lg">
        <p className="text-sm text-slate-500">Preparando replay do Play-by-Play…</p>
      </Card>
    )
  }

  const { teams } = feed
  const animClass = animationClass(frame.animation)

  return (
    <div className="flex flex-col gap-4 pb-10">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[var(--ds-hero-from)] via-[var(--ds-hero-via)] to-[var(--ds-hero-to)] p-5 text-white shadow-hero animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/90">
          <span>Ao vivo · Simulation PBP</span>
          <span>
            {formatQuarter(frame.quarter)} · {frame.clock}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <ScoreSide
            short={teams.home.short}
            score={frame.score.home}
            animKey={animKey}
          />
          <div className="text-center">
            <p className="font-display text-2xl font-black text-white/25">VS</p>
            <p className="mt-1 text-xs text-blue-100/70">
              {frame.progress}% · {frame.index + 1}/{feed.frameCount}
            </p>
          </div>
          <ScoreSide
            short={teams.away.short}
            score={frame.score.away}
            animKey={animKey}
            align="right"
          />
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${frame.progress}%` }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          disabled={done}
        >
          {playing ? 'Pausar' : 'Continuar'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setFrameIndex(feed.frameCount - 1)
            setPlaying(false)
            setAnimKey((k) => k + 1)
          }}
        >
          Pular ao fim
        </Button>
        <div className="flex flex-wrap gap-1">
          {Object.values(LIVE_PLAYBACK_SPEEDS).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => changeSpeed(s.id)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                speedId === s.id
                  ? 'bg-navy text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Card
        key={animKey}
        padding="lg"
        className={`border-court/20 ${animClass}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={frame.play.isScoring ? 'blue' : 'neutral'}>
            {frame.play.actionLabel}
          </Badge>
          {frame.play.points > 0 ? (
            <span className="font-display text-lg font-extrabold text-accent">
              +{frame.play.points}
            </span>
          ) : null}
          {frame.play.isTimeout ? <Badge tone="warning">Timeout</Badge> : null}
          {frame.play.isFoul ? <Badge tone="danger">Falta</Badge> : null}
        </div>
        <p className="mt-3 font-display text-xl font-bold leading-snug text-navy sm:text-2xl">
          {frame.play.text}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {frame.play.scorer ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
              Marcou: {frame.play.scorer}
            </span>
          ) : null}
          {frame.play.assister ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-800">
              Assistência: {frame.play.assister}
            </span>
          ) : null}
          {frame.play.fouler ? (
            <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-800">
              Falta: {frame.play.fouler}
            </span>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Sequência das jogadas
          </p>
          <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
            {[...(frame.sequence ?? [])].reverse().map((p) => (
              <li
                key={`${p.id}-${p.seq}`}
                className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-700"
              >
                <span className="mr-2 font-semibold text-slate-400">
                  {typeof p.quarter === 'number' ? `Q${p.quarter}` : p.quarter}
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Momentum
            </p>
            <MomBar
              label={teams.home.short}
              value={frame.momentum.home}
              active={frame.momentum.leader === 'home'}
            />
            <MomBar
              label={teams.away.short}
              value={frame.momentum.away}
              active={frame.momentum.leader === 'away'}
              className="mt-3"
            />
          </Card>

          <Card padding="lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Probabilidade de vitória
            </p>
            <div className="mt-2 flex justify-between font-display text-2xl font-extrabold text-navy">
              <span>{frame.winProbability.homeWinPct}%</span>
              <span>{frame.winProbability.awayWinPct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${frame.winProbability.homeWinPct}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card padding="lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Estatísticas ao vivo
          </p>
          <LiveStatTable
            homeShort={teams.home.short}
            awayShort={teams.away.short}
            home={frame.teamStats.home}
            away={frame.teamStats.away}
          />
        </Card>
        <Card padding="lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Faltas & Timeouts
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <CountBlock
              label={`${teams.home.short} faltas`}
              value={frame.fouls.home}
            />
            <CountBlock
              label={`${teams.away.short} faltas`}
              value={frame.fouls.away}
            />
            <CountBlock
              label={`${teams.home.short} T.O.`}
              value={frame.timeouts.home}
            />
            <CountBlock
              label={`${teams.away.short} T.O.`}
              value={frame.timeouts.away}
            />
          </div>
        </Card>
      </div>

      {done ? (
        <Card padding="lg" className="border-emerald-200 bg-emerald-50/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Fim da transmissão
          </p>
          <p className="mt-1 font-display text-xl font-extrabold text-navy">
            {feed.summary}
          </p>
          {frame.mvp ? (
            <p className="mt-2 text-sm text-slate-600">
              MVP: {frame.mvp.name} ({frame.mvp.teamShort}) — {frame.mvp.points}{' '}
              PTS / {frame.mvp.rebounds} REB / {frame.mvp.assists} AST
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="accent" onClick={() => navigate('/match')}>
              Ver box score completo
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFrameIndex(0)
                setPlaying(true)
                setAnimKey((k) => k + 1)
              }}
            >
              Replay
            </Button>
            <Link
              to="/match-center"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 no-underline"
            >
              Match Center
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function ScoreSide({ short, score, animKey, align = 'left' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="font-display text-sm font-bold text-blue-100/80">{short}</p>
      <p
        key={`${animKey}-${score}`}
        className="animate-fade-up font-display text-5xl font-extrabold tabular-nums tracking-tight"
      >
        {score}
      </p>
    </div>
  )
}

function MomBar({ label, value, active, className = '' }) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs">
        <span className={`font-bold ${active ? 'text-navy' : 'text-slate-500'}`}>
          {label}
        </span>
        <span className="tabular-nums font-semibold text-navy">{value}</span>
      </div>
      <ProgressBar
        value={value}
        barClassName={active ? 'bg-accent' : 'bg-slate-400'}
      />
    </div>
  )
}

function LiveStatTable({ homeShort, awayShort, home, away }) {
  const rows = [
    ['Pontos', home.points, away.points],
    ['Assistências', home.assists, away.assists],
    ['Cestas', home.fieldGoals, away.fieldGoals],
    ['Bolas de 3', home.threes, away.threes],
  ]
  return (
    <table className="mt-2 w-full text-sm">
      <thead>
        <tr className="text-[10px] uppercase tracking-wider text-slate-400">
          <th className="py-1 text-left font-semibold">Stat</th>
          <th className="py-1 text-center font-semibold">{homeShort}</th>
          <th className="py-1 text-center font-semibold">{awayShort}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, h, a]) => (
          <tr key={label} className="border-t border-slate-100">
            <td className="py-1.5 text-slate-600">{label}</td>
            <td className="py-1.5 text-center font-bold tabular-nums text-navy">
              {h}
            </td>
            <td className="py-1.5 text-center font-bold tabular-nums text-navy">
              {a}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CountBlock({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="font-display text-2xl font-extrabold tabular-nums text-navy">
        {value}
      </p>
    </div>
  )
}

function formatQuarter(q) {
  if (q === 'OT' || q === 'ot') return 'Prorrogação'
  if (typeof q === 'number') return `${q}º quarto`
  return String(q ?? '—')
}

function animationClass(cue) {
  switch (cue) {
    case 'three_flash':
      return 'animate-fade-up shadow-md shadow-accent/10'
    case 'timeout_break':
      return 'animate-fade-up border-amber-200'
    case 'final_horn':
      return 'animate-fade-up border-emerald-300'
    default:
      return 'animate-fade-up'
  }
}
