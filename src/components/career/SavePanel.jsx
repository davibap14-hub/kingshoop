import { useState } from 'react'
import { TEAMS } from '../../data/teams'
import { useGameStore } from '../../store/useGameStore'
import { Badge, Button, Card, CardHeader } from '../ui'

function formatWhen(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function teamShort(teamId) {
  return TEAMS.find((t) => t.id === teamId)?.short ?? teamId ?? '—'
}

/**
 * Interface do Save System — múltiplos slots + LocalStorage.
 */
export default function SavePanel() {
  const saveList = useGameStore((s) => s.saveList)
  const activeSaveId = useGameStore((s) => s.activeSaveId)
  const lastSaveAt = useGameStore((s) => s.lastSaveAt)
  const lastSaveMessage = useGameStore((s) => s.lastSaveMessage)
  const history = useGameStore((s) => s.history)
  const careerStats = useGameStore((s) => s.careerStats)
  const createSaveSlot = useGameStore((s) => s.createSaveSlot)
  const saveNow = useGameStore((s) => s.saveNow)
  const loadSaveSlot = useGameStore((s) => s.loadSaveSlot)
  const deleteSaveSlot = useGameStore((s) => s.deleteSaveSlot)
  const renameSaveSlot = useGameStore((s) => s.renameSaveSlot)

  const [newName, setNewName] = useState('')
  const [renameId, setRenameId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const recentHistory = [...(history ?? [])].slice(-6).reverse()

  return (
    <Card id="saves" padding="lg" className="animate-fade-up">
      <CardHeader
        subtitle="Save System"
        title="Saves"
        action={
          <Badge tone="blue">LocalStorage</Badge>
        }
      />

      <p className="-mt-2 mb-4 text-xs text-slate-500">
        {lastSaveMessage}
        {lastSaveAt ? ` · ${formatWhen(lastSaveAt)}` : ''}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do novo save"
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-navy outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <Button
          variant="accent"
          onClick={() => {
            createSaveSlot(newName || undefined)
            setNewName('')
          }}
        >
          Novo save
        </Button>
        <Button variant="secondary" onClick={() => saveNow()}>
          Salvar agora
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {(saveList ?? []).length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            Nenhum save ainda. Avance uma semana para auto-salvar ou crie um
            slot.
          </p>
        )}

        {(saveList ?? []).map((slot) => {
          const active = slot.id === activeSaveId
          const s = slot.summary ?? {}
          return (
            <div
              key={slot.id}
              className={[
                'rounded-lg border px-3 py-3 transition',
                active
                  ? 'border-accent/40 bg-accent-soft/40'
                  : 'border-slate-200 bg-white',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-navy">{slot.name}</p>
                    {active && <Badge tone="blue">Ativo</Badge>}
                    {slot.auto && <Badge tone="neutral">Auto</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {s.playerName ?? 'Jogador'} · {teamShort(s.teamId)} · T
                    {s.season ?? '?'} Sem {s.week ?? '?'}
                    {s.overall != null ? ` · OVR ${s.overall}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Atualizado {formatWhen(slot.updatedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={active}
                    onClick={() => loadSaveSlot(slot.id)}
                  >
                    Carregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenameId(slot.id)
                      setRenameValue(slot.name)
                    }}
                  >
                    Renomear
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => deleteSaveSlot(slot.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>

              {renameId === slot.id && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      renameSaveSlot(slot.id, renameValue)
                      setRenameId(null)
                    }}
                  >
                    Ok
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Estatísticas
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>Semanas jogadas: {careerStats?.weeksPlayed ?? 0}</li>
            <li>Eventos resolvidos: {careerStats?.eventsResolved ?? 0}</li>
            <li>XP total: {careerStats?.totalXpEarned ?? 0}</li>
            <li>Level-ups: {careerStats?.levelsGained ?? 0}</li>
            <li>
              Pico OVR / Pop:{' '}
              {careerStats?.peakOverall ?? 0} / {careerStats?.peakPopularidade ?? 0}
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Histórico recente
          </p>
          {recentHistory.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Sem entradas ainda.</p>
          ) : (
            <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto text-xs text-slate-600">
              {recentHistory.map((entry, i) => (
                <li key={`${entry.at}-${i}`} className="leading-snug">
                  <span className="font-semibold text-navy">
                    {entry.type === 'event' ? 'Evento' : 'Semana'}
                  </span>{' '}
                  T{entry.season} S{entry.week}
                  {entry.activityLabel ? ` · ${entry.activityLabel}` : ''}
                  {entry.choiceId ? ` · escolha ${entry.choiceId}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  )
}
