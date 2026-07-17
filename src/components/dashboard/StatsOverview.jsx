import { BarChart, LineChart, RadarChart } from '../charts'
import { Card, CardHeader, MetricCard } from '../ui'

/**
 * Visão de estatísticas + gráficos — reutilizável.
 */
export default function StatsOverview({
  attributes = [],
  metrics = [],
  trend = [],
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {metrics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader subtitle="Gráficos" title="Atributos" />
          <RadarChart data={attributes} />
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <CardHeader subtitle="Gráficos" title="Comparativo" />
          <BarChart
            data={attributes.map((a) => ({
              label: a.short ?? a.label.slice(0, 3),
              value: a.value,
            }))}
          />
        </Card>
      </div>

      {trend.length > 0 && (
        <Card className="animate-fade-up">
          <CardHeader
            subtitle="Tendência"
            title="Forma recente"
            action={
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Últimas semanas
              </span>
            }
          />
          <LineChart data={trend} />
        </Card>
      )}
    </div>
  )
}
