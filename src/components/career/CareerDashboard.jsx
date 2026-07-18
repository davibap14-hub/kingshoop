import { ATTRIBUTE_KEYS, ATTRIBUTES } from '../../data/constants/attributes'
import { getTeamById } from '../../data/teams'
import {
  NextMatch,
  PlayerStatus,
  SeasonCalendar,
  StatsOverview,
} from '../dashboard'
import { SectionHeader } from '../ui'
import { gameService } from '../../services/gameService'
import { useCareerSnapshot } from '../../hooks/useCareer'
import { useState } from 'react'
import CareerPanel from './CareerPanel'
import FinancePanel from './FinancePanel'
import GameHub from './GameHub'
import GmPanel from './GmPanel'
import BalancePanel from './BalancePanel'
import ContractPanel from './ContractPanel'
import AchievementsPanel from './AchievementsPanel'
import AnalyticsPanel from './AnalyticsPanel'
import HallOfFamePanel from './HallOfFamePanel'
import HistoryPanel from './HistoryPanel'
import NewsPanel from './NewsPanel'
import ProgressionPanel from './ProgressionPanel'
import ChemistryPanel from './ChemistryPanel'
import DnaPanel from './DnaPanel'
import PlaybookPanel from './PlaybookPanel'
import DefensePanel from './DefensePanel'
import FatiguePanel from './FatiguePanel'
import MomentumPanel from './MomentumPanel'
import TradePanel from './TradePanel'
import CoachPanel from './CoachPanel'
import InjuryPanel from './InjuryPanel'
import RelationshipPanel from './RelationshipPanel'
import ScoutingPanel from './ScoutingPanel'
import SavePanel from './SavePanel'
import SeasonPanel from './SeasonPanel'
import WeekControls from './WeekControls'

function buildTrend(currentWeek, overall, status) {
  const len = Math.min(6, Math.max(3, currentWeek))
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
  const [showDetails, setShowDetails] = useState(false)
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
    currentTeamId,
    finance,
    season,
    progression,
    weekEffects,
  } = useCareerSnapshot()

  const seasonView = season
    ? gameService.getSeasonView({
        season,
        currentTeamId,
        currentWeek,
      })
    : null

  const next = seasonView?.nextGame
  const homeTeam = next ? getTeamById(next.game.homeId) : team
  const awayTeam = next ? getTeamById(next.game.awayId) : null
  const isHome = next ? next.game.homeId === currentTeamId : true

  const attributes = ATTRIBUTE_KEYS.map((key) => ({
    label: ATTRIBUTES[key].label,
    short: ATTRIBUTES[key].short,
    value: playerStats?.[key] ?? 0,
  }))

  const record = seasonView?.teamRecord
  const metrics = [
    {
      label: 'Overall',
      value: overall,
      hint: player?.posicao ?? 'SG',
      progress: overall,
      tone: 'dark',
    },
    {
      label: 'Record',
      value: record ? `${record.wins}-${record.losses}` : '0-0',
      hint: record ? `Seq. ${record.streakLabel}` : 'Liga',
      tone: 'blue',
    },
    {
      label: 'Energia',
      value: status?.energia ?? 0,
      progress: status?.energia ?? 0,
      tone: 'blue',
    },
    {
      label: 'Caixa',
      value: `$${Number(status?.dinheiro ?? 0).toLocaleString('en-US')}`,
      hint: `Patrimônio $${Number(finance?.patrimonio ?? 0).toLocaleString('en-US')}`,
      tone: 'muted',
    },
  ]

  const trend = buildTrend(currentWeek, overall, status)

  return (
    <div className="flex flex-col gap-8 pb-8">
      <GameHub
        playerName={playerName}
        team={team}
        overall={overall}
        status={status}
        injury={injury}
        player={player}
        currentWeek={currentWeek}
        currentSeason={currentSeason}
        currentTeamId={currentTeamId}
        seasonView={seasonView}
        finance={finance}
        progression={progression}
        weekEffects={weekEffects}
      />

      {/* Gráficos e painéis técnicos — secundários */}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            eyebrow="Painel técnico"
            title="Gráficos e engines"
            description="Detalhes opcionais — o jogo acontece acima."
          />
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy shadow-sm transition hover:border-navy/30"
          >
            {showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
          </button>
        </div>

        {showDetails ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-12">
            <div className="flex flex-col gap-4 xl:col-span-8">
              <div className="opacity-90 [&_.grid]:gap-3">
                <StatsOverview
                  attributes={attributes}
                  metrics={metrics}
                  trend={trend}
                  className="[&>div:nth-child(2)]:max-h-[280px] [&>div:nth-child(2)]:overflow-hidden"
                />
              </div>

              <WeekControls />
              <NewsPanel />
              <ContractPanel />
              <RelationshipPanel />
              <DnaPanel />
              <PlaybookPanel />
              <DefensePanel />
              <FatiguePanel />
              <MomentumPanel />
              <TradePanel />
              <ChemistryPanel />
              <InjuryPanel />
              <CoachPanel />
              <ScoutingPanel />
              <AnalyticsPanel />
              <AchievementsPanel />
              <HallOfFamePanel />
              <HistoryPanel />
              <SeasonPanel />
              <GmPanel />
              <BalancePanel />
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
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                week={next?.week ?? currentWeek}
                venue={isHome ? 'Casa' : 'Visitante'}
              />
              <SeasonCalendar
                currentWeek={currentWeek}
                currentSeason={currentSeason}
              />
            </aside>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Status compacto: OVR {overall} · {team?.short ?? '—'} ·{' '}
            {record ? `${record.wins}-${record.losses}` : '0-0'} · Energia{' '}
            {status?.energia ?? 0}. Abra os detalhes só se precisar de gráficos
            ou engines avançadas.
          </p>
        )}
      </div>
    </div>
  )
}
