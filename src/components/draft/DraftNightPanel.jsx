/**
 * Interface — Draft Night (transmissão ESPN).
 * Só avança frames da Draft Night Engine. Sem lógica de escolha.
 */

import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DRAFT_NIGHT_SPEEDS } from '../../data/draftNight'
import { gameService } from '../../services/gameService'
import { useDraftNightStore } from '../../store/useDraftNightStore'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, ProgressBar } from '../ui'

export default function DraftNightPanel() {
  const navigate = useNavigate()
  const gm = useGameStore((s) => s.gm)
  const season = useGameStore((s) => s.season)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const applyDraftNightResult = useGameStore((s) => s.applyDraftNightResult)

  const broadcast = useDraftNightStore((s) => s.broadcast)
  const isBuilding = useDraftNightStore((s) => s.isBuilding)
  const lastError = useDraftNightStore((s) => s.lastError)
  const startLive = useDraftNightStore((s) => s.startLive)
  const startReplay = useDraftNightStore((s) => s.startReplay)
  const rescaleSpeed = useDraftNightStore((s) => s.rescaleSpeed)
  const clearBroadcast = useDraftNightStore((s) => s.clear)

  const [speedId, setSpeedId] = useState('normal')
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [animKey, setAnimKey] = useState(0)
  const [clockLeft, setClockLeft] = useState(null)

  const status = gameService.getDraftNightStatus({
    gm,
    season,
    currentSeason,
    currentWeek,
    currentTeamId,
  })

  const frame = broadcast
    ? gameService.getDraftNightFrame(broadcast, frameIndex)
    : null
  const done = Boolean(
    broadcast && frameIndex >= broadcast.frameCount - 1,
  )

  const onTick = useEffectEvent(() => {
    if (!broadcast || !playing || done) return
    setFrameIndex((i) => Math.min(i + 1, broadcast.frameCount - 1))
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

  // Relógio visual da escolha
  useEffect(() => {
    if (!frame?.clock?.running || !frame.clock.totalMs) {
      setClockLeft(null)
      return undefined
    }
    const total = frame.clock.totalMs
    setClockLeft(total)
    const started = Date.now()
    const id = setInterval(() => {
      const left = Math.max(0, total - (Date.now() - started))
      setClockLeft(left)
    }, 100)
    return () => clearInterval(id)
  }, [frame?.index, frame?.clock?.running, frame?.clock?.totalMs])

  const careerState = {
    gm,
    season,
    currentTeamId,
    currentWeek,
    currentSeason,
  }

  const beginLive = () => {
    const built = startLive(careerState)
    if (!built.ok) return
    applyDraftNightResult({
      gm: built.gm,
      picks: built.picks,
      summary: built.broadcast?.summary,
    })
    setFrameIndex(0)
    setPlaying(true)
    setAnimKey((k) => k + 1)
    setSpeedId(built.broadcast?.speedId ?? 'normal')
  }

  const beginReplay = () => {
    const built = startReplay(careerState)
    if (!built.ok) return
    setFrameIndex(0)
    setPlaying(true)
    setAnimKey((k) => k + 1)
    setSpeedId(built.broadcast?.speedId ?? 'normal')
  }

  const changeSpeed = (id) => {
    setSpeedId(id)
    rescaleSpeed(id)
  }

  if (!broadcast) {
    return (
      <Lobby
        status={status}
        isBuilding={isBuilding}
        lastError={lastError}
        onLive={beginLive}
        onReplay={beginReplay}
        onBack={() => navigate('/')}
      />
    )
  }

  if (!frame) {
    return (
      <Card padding="lg">
        <p className="text-sm text-slate-500">Abrindo a transmissão…</p>
      </Card>
    )
  }

  const clockSec =
    clockLeft != null ? Math.ceil(clockLeft / 1000) : null

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Faixa on-air */}
      <section className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#0b1524] via-[#12263f] to-[#1a3a5c] p-5 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.35), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(250,204,21,0.12), transparent 50%)',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Ao vivo
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-100/80">
              Draft Night · T{broadcast.seasonNumber}
              {broadcast.mode === 'replay' ? ' · Replay' : ''}
            </p>
          </div>
          <p className="font-mono text-xs text-blue-100/70">
            Pick {frame.totalAnnounced}/{broadcast.totalPicks} · {frame.progress}%
          </p>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
              {frame.clock.label}
            </p>
            <h1
              key={animKey}
              className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl animate-fade-up"
            >
              {frame.headline}
            </h1>
            {frame.lastPick && (
              <p className="mt-2 text-sm text-blue-100/80">
                #{frame.lastPick.pickNumber} · {frame.lastPick.teamShort} ·{' '}
                {frame.lastPick.posicao} · {frame.lastPick.universidade}
                {frame.lastPick.mockRank != null
                  ? ` · Mock #${frame.lastPick.mockRank}`
                  : ''}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30 px-6 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Relógio
            </p>
            <p
              className={[
                'mt-1 font-mono text-5xl font-black tabular-nums',
                clockSec != null && clockSec <= 5
                  ? 'text-red-400'
                  : 'text-amber-300',
              ].join(' ')}
            >
              {frame.phase === 'final'
                ? '00'
                : clockSec != null
                  ? String(clockSec).padStart(2, '0')
                  : '--'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {frame.clock.teamShort
                ? `${frame.clock.teamShort} · #${frame.clock.pickNumber ?? '—'}`
                : 'Mesa fechada'}
            </p>
          </div>

          <div className="lg:text-right">
            <CrowdBlock crowd={frame.crowd} animKey={animKey} />
          </div>
        </div>

        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${frame.progress}%` }}
          />
        </div>
      </section>

      {/* Controles */}
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
            setFrameIndex((i) => Math.min(i + 1, broadcast.frameCount - 1))
            setAnimKey((k) => k + 1)
          }}
          disabled={done}
        >
          Próxima pick
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setFrameIndex(broadcast.frameCount - 1)
            setPlaying(false)
            setAnimKey((k) => k + 1)
          }}
        >
          Ir ao fim
        </Button>
        <div className="flex flex-wrap gap-1">
          {Object.values(DRAFT_NIGHT_SPEEDS).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => changeSpeed(s.id)}
              className={[
                'rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider',
                speedId === s.id
                  ? 'bg-navy text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            clearBroadcast()
            setFrameIndex(0)
            setPlaying(true)
          }}
        >
          Encerrar transmissão
        </Button>
      </div>

      {/* Grid principal — atualiza a cada pick */}
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-4">
          <Panel title="Mock Draft" eyebrow="Board público">
            <MockList items={frame.mockBoard?.length ? frame.mockBoard : frame.mockDraft} />
          </Panel>
          <Panel title="Prospects disponíveis" eyebrow="Board restante">
            <AvailableList items={frame.available} />
          </Panel>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-5">
          <Panel title="Análise do prospect" eyebrow="Mesa ESPN">
            <AnalysisBlock analysis={frame.analysis} />
          </Panel>
          <Panel title="Comparação" eyebrow="Lado a lado">
            <ComparisonBlock comparison={frame.comparison} />
          </Panel>
          <Panel title="Picks anunciadas" eyebrow="Ordem do draft">
            <PicksTape picks={frame.picks} />
          </Panel>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-3">
          <Panel title="Necessidades da franquia" eyebrow="No relógio">
            <NeedsBlock needs={frame.franchiseNeeds} />
          </Panel>
          <Panel title="Reação da torcida" eyebrow="Arena">
            <CrowdDetail crowd={frame.crowd} />
          </Panel>
          <Panel title="Notícias em tempo real" eyebrow="Ticker">
            <NewsTicker items={frame.news} />
          </Panel>
        </div>
      </div>

      {done && (
        <Card padding="md" className="border-amber-200 bg-amber-50/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Transmissão encerrada
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {broadcast.summary} · {broadcast.undraftedCount ?? 0} undrafted na liga.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/')}>
                Voltar ao hub
              </Button>
              <Button
                onClick={() => {
                  clearBroadcast()
                  setFrameIndex(0)
                }}
              >
                Nova sessão
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function Lobby({ status, isBuilding, lastError, onLive, onReplay, onBack }) {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <section className="relative overflow-hidden rounded-2xl border border-navy/15 bg-gradient-to-br from-[#0b1524] via-[#152f4d] to-[#1e4568] p-6 text-white shadow-xl sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(135deg, transparent 40%, rgba(250,204,21,0.08) 100%), repeating-linear-gradient(-12deg, transparent, transparent 12px, rgba(255,255,255,0.02) 12px, rgba(255,255,255,0.02) 13px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]">
              Draft Night
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
              Transmissão especial
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
            A noite do Draft
          </h1>
          <p className="mt-2 max-w-xl text-sm text-blue-100/85">
            Relógio da escolha, Mock Draft, board ao vivo, necessidades da
            franquia, análise e reação da torcida — painel atualiza a cada pick.
          </p>
          <p className="mt-4 text-sm text-amber-200/90">{status.message}</p>

          {lastError && (
            <p className="mt-2 text-sm text-red-300">{lastError}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {status.canStartLive && (
              <Button onClick={onLive} disabled={isBuilding}>
                {isBuilding ? 'Montando transmissão…' : 'Iniciar Draft Night'}
              </Button>
            )}
            {status.canReplay && (
              <Button
                variant={status.canStartLive ? 'secondary' : 'primary'}
                onClick={onReplay}
                disabled={isBuilding}
              >
                Replay do último Draft
              </Button>
            )}
            <Button variant="ghost" onClick={onBack}>
              Voltar ao hub
            </Button>
          </div>
        </div>
      </section>

      {status.mockTop?.length > 0 && (
        <Card padding="md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Mock Draft — topo da classe
          </p>
          <ul className="mt-3 divide-y divide-slate-100">
            {status.mockTop.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="font-semibold text-navy">
                  <span className="mr-2 font-mono text-slate-400">
                    #{p.mockRank ?? '—'}
                  </span>
                  {p.nome}
                </span>
                <span className="text-xs text-slate-500">
                  {p.posicao} · {p.universidade}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!status.available && (
        <Card padding="md" className="text-center">
          <p className="text-sm text-slate-500">
            Avance a carreira até a offseason (revelação na semana 44) para
            liberar a classe e a transmissão.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-bold text-accent hover:underline"
          >
            Ir ao hub de jogo
          </Link>
        </Card>
      )}
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

function MockList({ items = [] }) {
  if (!items.length) {
    return <p className="text-xs text-slate-400">Board vazio.</p>
  }
  return (
    <ul className="space-y-1.5">
      {items.slice(0, 10).map((p) => (
        <li
          key={p.id}
          className={[
            'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs',
            p.drafted ? 'bg-slate-100 text-slate-400 line-through' : 'bg-ice',
          ].join(' ')}
        >
          <span>
            <span className="mr-2 font-mono font-bold text-slate-500">
              {p.rank}
            </span>
            <span className="font-semibold text-navy">{p.nome}</span>
            <span className="ml-1 text-slate-400">{p.posicao}</span>
          </span>
          {p.drafted ? (
            <Badge tone="neutral">
              #{p.draftedPick} {p.draftedShort}
            </Badge>
          ) : (
            <span className="text-slate-400">{p.universidade}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

function AvailableList({ items = [] }) {
  if (!items.length) {
    return <p className="text-xs text-slate-400">Nenhum prospect restante.</p>
  }
  return (
    <ul className="space-y-2">
      {items.slice(0, 8).map((p) => (
        <li key={p.id} className="flex items-start justify-between gap-2 text-xs">
          <div>
            <p className="font-semibold text-navy">
              #{p.mockRank} {p.nome}
            </p>
            <p className="text-slate-500">
              {p.posicao} · {p.universidade} · OVR {p.overall} · POT {p.potencial}
            </p>
          </div>
          {p.scouted ? (
            <Badge tone="blue">Scout</Badge>
          ) : (
            <Badge tone="neutral">??</Badge>
          )}
        </li>
      ))}
    </ul>
  )
}

function AnalysisBlock({ analysis }) {
  if (!analysis) {
    return <p className="text-xs text-slate-400">Aguardando prospect no foco.</p>
  }
  return (
    <div className="space-y-3">
      <div>
        <p className="font-display text-lg font-bold text-navy">{analysis.nome}</p>
        <p className="text-xs text-slate-500">
          {analysis.posicao} · {analysis.universidade} · {analysis.idade} anos
        </p>
      </div>
      <p className="text-sm text-slate-700">{analysis.headline}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <StatBox label="OVR" value={analysis.overall} />
        <StatBox label="POT" value={analysis.potencial} />
        <StatBox label="Teto" value={analysis.ceiling} small />
        <StatBox label="Piso" value={analysis.floor} small />
      </div>
      <p className="text-xs font-semibold text-accent">{analysis.needLabel}</p>
      {analysis.strengths?.length > 0 && (
        <p className="text-xs text-slate-500">
          Forças:{' '}
          {analysis.strengths.map((s) => s.label).join(' · ')}
        </p>
      )}
    </div>
  )
}

function ComparisonBlock({ comparison }) {
  if (!comparison) {
    return (
      <p className="text-xs text-slate-400">
        Precisa de dois nomes no board para comparar.
      </p>
    )
  }
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 text-center">
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
              {axis.a}
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
              {axis.b}
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

function NeedsBlock({ needs }) {
  if (!needs) {
    return <p className="text-xs text-slate-400">Nenhuma franquia no relógio.</p>
  }
  return (
    <div>
      <p className="font-display text-base font-bold text-navy">
        {needs.teamShort}
      </p>
      <p className="text-xs text-slate-500">
        {needs.teamName} · modo {needs.mode} · elenco {needs.rosterSize} · OVR{' '}
        {needs.avgOvr}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {needs.needs?.length ? (
          needs.needs.map((pos) => (
            <Badge key={pos} tone="danger">
              Precisa {pos}
            </Badge>
          ))
        ) : (
          <Badge tone="blue">BPA / upside</Badge>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-600">{needs.blurb}</p>
    </div>
  )
}

function CrowdBlock({ crowd, animKey }) {
  if (!crowd) return null
  return (
    <div key={animKey} className="animate-fade-up">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/90">
        {crowd.label}
      </p>
      <p className="mt-1 text-sm font-medium text-white/90">{crowd.chant}</p>
      <div className="mt-2">
        <ProgressBar value={crowd.heat} max={100} />
        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
          Calor da arena {crowd.heat}
        </p>
      </div>
    </div>
  )
}

function CrowdDetail({ crowd }) {
  if (!crowd) {
    return <p className="text-xs text-slate-400">Arena em silêncio tenso.</p>
  }
  const toneColor = {
    steal: 'blue',
    reach: 'danger',
    electric: 'blue',
    home: 'blue',
    solid: 'neutral',
    neutral: 'neutral',
  }
  return (
    <div>
      <Badge tone={toneColor[crowd.tone] ?? 'neutral'}>{crowd.label}</Badge>
      <p className="mt-2 text-sm text-slate-700">{crowd.chant}</p>
      <ProgressBar className="mt-3" value={crowd.heat} max={100} />
    </div>
  )
}

function NewsTicker({ items = [] }) {
  if (!items.length) {
    return <p className="text-xs text-slate-400">Fio quieto.</p>
  }
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto">
      {items.map((n) => (
        <li
          key={n.id}
          className={[
            'rounded-md border-l-2 px-2 py-1.5 text-xs',
            n.tone === 'steal'
              ? 'border-l-accent bg-accent-soft/40'
              : n.tone === 'reach'
                ? 'border-l-red-400 bg-red-50'
                : n.tone === 'alert'
                  ? 'border-l-amber-400 bg-amber-50'
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

function PicksTape({ picks = [] }) {
  if (!picks.length) {
    return <p className="text-xs text-slate-400">Nenhuma escolha anunciada ainda.</p>
  }
  return (
    <ol className="max-h-48 space-y-1 overflow-y-auto">
      {[...picks].reverse().map((p) => (
        <li
          key={p.pickNumber}
          className={[
            'flex items-center justify-between gap-2 rounded px-2 py-1 text-xs',
            p.isPlayerTeam ? 'bg-accent-soft/50' : 'hover:bg-slate-50',
          ].join(' ')}
        >
          <span>
            <span className="mr-2 font-mono text-slate-400">#{p.pickNumber}</span>
            <span className="font-semibold text-navy">{p.teamShort}</span>
            <span className="text-slate-500"> → {p.prospectName}</span>
          </span>
          <span className="text-slate-400">{p.posicao}</span>
        </li>
      ))}
    </ol>
  )
}

function StatBox({ label, value, small }) {
  return (
    <div className="rounded-md bg-ice px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={
          small
            ? 'mt-0.5 text-[11px] font-semibold leading-snug text-navy'
            : 'mt-0.5 font-display text-xl font-bold text-navy'
        }
      >
        {value}
      </p>
    </div>
  )
}
