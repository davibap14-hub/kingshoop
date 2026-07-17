import { ATTRIBUTE_KEYS, ATTRIBUTES } from '../../data/constants/attributes'
import { TEAMS } from '../../data/teams'
import {
  NextMatch,
  PlayerStatus,
  SeasonCalendar,
  StatsOverview,
} from '../dashboard'
import { SectionHeader } from '../ui'
import { useCareerSnapshot } from '../../hooks/useCareer'
import CareerPanel from './CareerPanel'
import EventChoicePanel from './EventChoicePanel'
import FinancePanel from './FinancePanel'
import ProgressionPanel from './ProgressionPanel'
import SavePanel from './SavePanel'
import WeekControls from './WeekControls'

function pickOpponent(teamId, week) {
  const others = TEAMS.filter((t) => t.id !== teamId)
  if (!others.length) return TEAMS[0]
  return others[(week - 1) % others.length]
}

function buildTrend(currentWeek, overall, status) {
  const len = Math.min(8, Math.max(3, currentWeek))
  const start = Math.max(1, currentWeek - len + 1)
  return Array.from({ length: len }, (_, i) => {
    const week = start + i
    const wave =
      ((status?.energia ?? 50) + (status?.motivacao ?? 50)) / 40 +
      Math.sin(week * 0.7) * 2
    return {
      label: `S${week}`,
      value: Math.round(Math.max(60, Math.min(99, overall - 4 + i * 0.6 + wave))),
    }
  })
}

export default function CareerDashboard() {
  const {
    playerName,
    team,
    overall,
    status,
    injury,
    player,
    playerStats,
    currentWeek,
    currentSeason,
    finance,
  } = useCareerSnapshot()

  const opponent = pickOpponent(team?.id, currentWeek)
  const isHome = currentWeek % 2 === 1

  const attributes = ATTRIBUTE_KEYS.map((key) => ({
    label: ATTRIBUTES[key].label,
    short: ATTRIBUTES[key].short,
    value: playerStats?.[key] ?? 0,
  }))

  const metrics = [
    {
      label: 'Overall',
      value: overall,
      hint: player?.posicao ?? 'SG',
      progress: overall,
      tone: 'dark',
    },
    {
      label: 'Caixa',
      value: `$${Number(status?.dinheiro ?? 0).toLocaleString('en-US')}`,
      hint: `Patrimônio $${Number(finance?.patrimonio ?? 0).toLocaleString('en-US')}`,
      tone: 'blue',
    },
    {
      label: 'Energia',
      value: status?.energia ?? 0,
      progress: status?.energia ?? 0,
      tone: 'blue',
    },
    {
      label: 'Popularidade',
      value: status?.popularidade ?? 0,
      progress: status?.popularidade ?? 0,
      tone: 'muted',
    },
  ]

  const trend = buildTrend(currentWeek, overall, status)

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="NBA Dashboard"
        title={playerName}
        description={`${team?.name ?? 'Free Agent'} · Temporada ${currentSeason} · Semana ${currentWeek}`}
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          <StatsOverview
            attributes={attributes}
            metrics={metrics}
            trend={trend}
          />

          <EventChoicePanel />
          <WeekControls />
          <SavePanel />
          <FinancePanel />
          <ProgressionPanel />
          <CareerPanel />
        </div>

        <aside className="flex flex-col gap-4 xl:col-span-4">
          <PlayerStatus
            playerName={playerName}
            team={team}
            position={player?.posicao}
            overall={overall}
            status={status}
            injury={injury}
          />
          <NextMatch
            homeTeam={isHome ? team : opponent}
            awayTeam={isHome ? opponent : team}
            week={currentWeek}
            venue={isHome ? 'Casa' : 'Visitante'}
          />
          <SeasonCalendar
            currentWeek={currentWeek}
            currentSeason={currentSeason}
          />
        </aside>
      </div>
    </div>
  )
}
