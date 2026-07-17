/**
 * Interface — apenas exibe o resultado da Match Engine.
 */

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

export default function MatchResult({ result }) {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Simule uma partida para ver placar, box score e MVP.
        </p>
      </div>
    )
  }

  const { placarFinal, mvp, quarters, boxScore, summary, styles } = result

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Placar final{result.overtime ? ' · Prorrogação' : ''}
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

      {mvp && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
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
