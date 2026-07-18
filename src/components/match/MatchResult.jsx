/**
 * Interface — exibe Simulation Engine + pacote da Presentation Engine.
 * A Presentation nunca altera o resultado; só interpreta para a UI.
 */

import { Card, CardHeader, Badge } from '../ui'

function StatCell({ value }) {
  return (
    <td className="px-2 py-1.5 text-center tabular-nums text-sm text-slate-700">
      {value}
    </td>
  )
}

function TeamTable({ box }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-display text-lg font-bold text-navy">
          {box.teamShort} — {box.teamName}
        </h3>
        <span className="font-display text-2xl font-extrabold text-navy">
          {box.totals.points}
        </span>
      </div>
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="px-4 py-2">Jogador</th>
            <th className="px-2 py-2 text-center">PTS</th>
            <th className="px-2 py-2 text-center">REB</th>
            <th className="px-2 py-2 text-center">AST</th>
            <th className="px-2 py-2 text-center">STL</th>
            <th className="px-2 py-2 text-center">BLK</th>
            <th className="px-2 py-2 text-center">TO</th>
            <th className="px-2 py-2 text-center">PF</th>
          </tr>
        </thead>
        <tbody>
          {box.players.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="px-4 py-1.5 text-sm font-semibold text-navy">
                <span className="mr-2 text-[10px] font-bold text-slate-400">
                  {p.posicao}
                </span>
                {p.nome}
              </td>
              <StatCell value={p.points} />
              <StatCell value={p.rebounds} />
              <StatCell value={p.assists} />
              <StatCell value={p.steals} />
              <StatCell value={p.blocks} />
              <StatCell value={p.turnovers} />
              <StatCell value={p.fouls} />
            </tr>
          ))}
          <tr className="border-t border-slate-200 bg-slate-50 font-bold">
            <td className="px-4 py-2 text-sm text-navy">TOTAL</td>
            <StatCell value={box.totals.points} />
            <StatCell value={box.totals.rebounds} />
            <StatCell value={box.totals.assists} />
            <StatCell value={box.totals.steals} />
            <StatCell value={box.totals.blocks} />
            <StatCell value={box.totals.turnovers} />
            <StatCell value={box.totals.fouls} />
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function PlayByPlay({ events = [] }) {
  if (!events.length) {
    return (
      <p className="text-xs text-slate-500">Play-by-Play indisponível.</p>
    )
  }

  return (
    <ul className="max-h-96 space-y-1.5 overflow-y-auto pr-1 text-xs">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-2 py-1.5"
        >
          <span className="w-10 shrink-0 font-semibold text-slate-400">
            {typeof e.quarter === 'number' ? `Q${e.quarter}` : e.quarter}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{e.actionLabel ?? e.action}</Badge>
              {e.points > 0 && (
                <span className="font-bold text-accent">+{e.points}</span>
              )}
              <span className="tabular-nums text-slate-400">
                {e.score?.home ?? 0}–{e.score?.away ?? 0}
              </span>
            </div>
            <p className="mt-0.5 text-slate-700">{e.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function HighlightsReel({ highlights = [] }) {
  if (!highlights.length) return null
  return (
    <Card padding="lg">
      <CardHeader
        subtitle="Presentation Engine"
        title="Destaques"
        action={<Badge tone="blue">{highlights.length}</Badge>}
      />
      <ul className="mt-2 space-y-2">
        {highlights.map((h) => (
          <li
            key={h.id}
            className="rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{h.label ?? h.type}</Badge>
              <span className="text-slate-400">
                {typeof h.quarter === 'number' ? `Q${h.quarter}` : h.quarter}
              </span>
              {h.score && (
                <span className="tabular-nums text-slate-400">
                  {h.score.home}–{h.score.away}
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-700">{h.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function MatchResult({ result, presentation = null }) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Simule uma partida para ver placar, box score, MVP e Play-by-Play.
        </p>
      </div>
    )
  }

  const { placarFinal, mvp, quarters, boxScore, summary, styles, playByPlay } =
    result
  const highlights = presentation?.highlights ?? []
  const stepCount = presentation?.sequence?.length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Simulation Engine
          {presentation ? ' · Presentation Engine' : ''}
          {result.overtime ? ' · Prorrogação' : ''}
          {result.possessionCount
            ? ` · ${result.possessionCount} posses`
            : ''}
          {stepCount ? ` · ${stepCount} passos` : ''}
        </p>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div>
            <p className="font-display text-sm font-bold text-slate-500">
              {placarFinal.homeTeam.short}
            </p>
            <p className="font-display text-5xl font-extrabold text-navy">
              {placarFinal.home}
            </p>
          </div>
          <span className="font-display text-2xl text-slate-300">–</span>
          <div>
            <p className="font-display text-sm font-bold text-slate-500">
              {placarFinal.awayTeam.short}
            </p>
            <p className="font-display text-5xl font-extrabold text-navy">
              {placarFinal.away}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{summary}</p>

        {styles && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[styles.home, styles.away].map((s, idx) => (
              <div
                key={s.id + idx}
                className="rounded-lg bg-slate-50 px-3 py-2 text-left ring-1 ring-slate-200"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {idx === 0 ? 'Casa' : 'Fora'} · AI Engine
                  {s.auto ? ' (auto)' : ''}
                </p>
                <p className="font-display text-base font-bold text-navy">
                  {s.label}{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    fit {s.fit}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">{s.reason}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quarters.map((q) => (
            <span
              key={q.quarter}
              className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
            >
              {typeof q.quarter === 'number' ? `Q${q.quarter}` : q.quarter}:{' '}
              {q.home}-{q.away}
            </span>
          ))}
        </div>
      </div>

      <HighlightsReel highlights={highlights} />

      {mvp && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            MVP da Partida
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy">
            {mvp.nome}{' '}
            <span className="text-base font-semibold text-slate-500">
              ({mvp.teamShort})
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {mvp.points} PTS · {mvp.rebounds} REB · {mvp.assists} AST ·{' '}
            {mvp.steals} STL · {mvp.blocks} BLK · {mvp.turnovers} TO ·{' '}
            {mvp.fouls} PF
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamTable box={boxScore.home} />
        <TeamTable box={boxScore.away} />
      </div>

      <Card padding="lg">
        <CardHeader
          subtitle="Play-by-Play"
          title="Posse a posse"
          action={
            <Badge tone="blue">
              {(playByPlay ?? []).length} eventos
            </Badge>
          }
        />
        <PlayByPlay events={playByPlay} />
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          ['Pontos', result.pontos],
          ['Rebotes', result.rebotes],
          ['Assistências', result.assistencias],
          ['Roubos', result.roubos],
          ['Tocos', result.tocos],
          ['Turnovers', result.turnovers],
          ['Faltas', result.faltas],
        ].map(([label, pair]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200/80 bg-white p-3 text-center shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p className="mt-1 font-display text-lg font-bold text-navy">
              {pair.home} – {pair.away}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
