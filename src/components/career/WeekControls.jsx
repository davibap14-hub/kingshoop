import { ARCHETYPE_LIST } from '../../data/constants/archetypes'
import { TEAMS } from '../../data/teams'
import { useGameStore } from '../../store/useGameStore'
import { Button, Card } from '../ui'

function formatDelta(key, value) {
  if (!value) return null
  const sign = value > 0 ? '+' : ''
  if (key === 'dinheiro') {
    return `${sign}$${Math.abs(value).toLocaleString('en-US')}`
  }
  return `${sign}${value}`
}

export default function WeekControls() {
  const currentWeek = useGameStore((s) => s.currentWeek)
  const currentSeason = useGameStore((s) => s.currentSeason)
  const currentTeamId = useGameStore((s) => s.currentTeamId)
  const archetypeId = useGameStore((s) => s.archetypeId)
  const playerName = useGameStore((s) => s.playerName)
  const lastEvent = useGameStore((s) => s.lastEvent)
  const availableActivities = useGameStore((s) => s.availableActivities)
  const selectedActivityId = useGameStore((s) => s.selectedActivityId)
  const weekEffects = useGameStore((s) => s.weekEffects)
  const injury = useGameStore((s) => s.injury)
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const pendingContractOffer = useGameStore((s) => s.pendingContractOffer)

  const setSelectedActivity = useGameStore((s) => s.setSelectedActivity)
  const runWeek = useGameStore((s) => s.runWeek)
  const setArchetype = useGameStore((s) => s.setArchetype)
  const setTeam = useGameStore((s) => s.setTeam)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const resetCareer = useGameStore((s) => s.resetCareer)
  const getOverall = useGameStore((s) => s.getOverall)

  const team = TEAMS.find((t) => t.id === currentTeamId)

  return (
    <Card className="flex flex-col gap-4" padding="lg">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Temporada {currentSeason}
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy">
            Semana {currentWeek}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {team?.name} · OVR {getOverall()}
            {injury ? ` · Lesionado: ${injury.label}` : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => resetCareer(archetypeId)}>
            Reset
          </Button>
          <Button
            variant="accent"
            onClick={() => runWeek(selectedActivityId)}
            disabled={Boolean(pendingEvent || pendingContractOffer)}
          >
            {pendingContractOffer
              ? 'Resolva o contrato'
              : pendingEvent
                ? 'Resolva a história'
                : 'Avançar Semana'}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Atividade da semana (apenas uma)
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {availableActivities.map((activity) => {
            const selected = selectedActivityId === activity.id
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => setSelectedActivity(activity.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  selected
                    ? 'border-navy bg-navy/5 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className="block text-sm font-bold text-navy">
                  {activity.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                  {activity.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Nome
          </span>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Arquétipo
          </span>
          <select
            value={archetypeId}
            onChange={(e) => setArchetype(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          >
            {ARCHETYPE_LIST.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Time
          </span>
          <select
            value={currentTeamId}
            onChange={(e) => setTeam(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-navy outline-none focus:border-court focus:ring-2 focus:ring-court/20"
          >
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.short} — {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {weekEffects ? (
        <div className="rounded-lg border border-navy/15 bg-navy/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Efeitos da semana — {weekEffects.activityLabel}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {weekEffects.messages.map((msg, idx) => (
              <li key={`${idx}-${msg.slice(0, 16)}`}>• {msg}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(weekEffects.deltas)
              .filter(([, v]) => v !== 0)
              .map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    value > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {key} {formatDelta(key, value)}
                </span>
              ))}
            {Object.entries(weekEffects.attributeDeltas || {}).map(
              ([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700"
                >
                  {key} {formatDelta(key, value)}
                </span>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Último evento
          </p>
          <p className="mt-1 text-sm text-slate-700">{lastEvent}</p>
        </div>
      )}
    </Card>
  )
}
