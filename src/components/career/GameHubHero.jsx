/**
 * Hero Section do Game Hub — faixa ~300px estilo NBA 2K / ESPN.
 * Interface only: lê store/season; sem lógica de Engine.
 */

import { ARCHETYPES } from '../../data/constants/archetypes'
import { CountUp, FadeIn } from '../motion'
import { Avatar, Button } from '../ui'

export default function GameHubHero({
  playerName,
  team,
  overall,
  player,
  status,
  injury,
  currentWeek,
  currentSeason,
  seasonView,
  archetypeId,
  seasonResults = [],
  ctaLabel,
  onCta,
  ctaDisabled = false,
  selectedActivityLabel = null,
}) {
  const arch = ARCHETYPES[archetypeId] ?? null
  const position = player?.posicao ?? '—'
  const isRookie = (currentSeason ?? 1) <= 1
  const record = seasonView?.teamRecord ?? { wins: 0, losses: 0, streakLabel: '—' }
  const streak = formatStreak(record)
  const lastPerf = getLastPerformance({
    results: seasonResults,
    weekResults: seasonView?.weekResults,
    teamId: team?.id,
    playerId: player?.id ?? 'career_player',
    playerName,
  })
  const primary = team?.colors?.primary ?? '#1D428A'
  const secondary = team?.colors?.secondary ?? '#FFC72C'
  const arenaName = team?.arena?.name ?? 'Arena'
  const mark = (team?.short ?? 'FA').slice(0, 3)

  return (
    <FadeIn
      as="section"
      className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 text-white shadow-hero"
      aria-label="Hero da carreira"
    >
      {/* Arena desfocada */}
      <div
        className="pointer-events-none absolute inset-0 scale-110"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 110%, ${primary}cc, transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 20%, ${secondary}55, transparent 50%),
            linear-gradient(160deg, #070d16 0%, ${primary} 48%, #0a1524 100%)
          `,
          filter: 'blur(2px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: 'perspective(400px) rotateX(52deg) translateY(40%) scale(1.4)',
          transformOrigin: 'center bottom',
          filter: 'blur(1.5px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-[12%] bottom-[18%] h-[42%] rounded-[50%] opacity-40"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse at center, ${secondary}88, transparent 70%)`,
          filter: 'blur(18px)',
        }}
      />

      {/* Gradiente escuro de leitura */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(105deg, rgba(5,10,18,0.92) 0%, rgba(5,10,18,0.72) 42%, rgba(5,10,18,0.35) 68%, rgba(5,10,18,0.78) 100%)',
        }}
      />

      {/* Logo franquia — marca d'água */}
      <div
        className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none opacity-[0.12] animate-fade-up"
        aria-hidden
      >
        <div
          className="flex h-64 w-64 items-center justify-center rounded-full border-[10px] font-display text-7xl font-black tracking-tighter sm:h-72 sm:w-72 sm:text-8xl"
          style={{ borderColor: secondary, color: secondary }}
        >
          {mark}
        </div>
      </div>

      <div className="relative flex h-full items-stretch gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
        {/* Foto grande do jogador */}
        <div className="relative flex w-[120px] shrink-0 flex-col justify-end sm:w-[150px]">
          <div className="relative flex h-full max-h-[260px] w-full items-end justify-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-white/10 via-black/20 to-black/50 shadow-lg">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `linear-gradient(180deg, ${primary}66 0%, transparent 55%)`,
              }}
            />
            <Avatar
              name={playerName}
              size="xl"
              className="relative z-[1] mb-6 !h-24 !w-24 !rounded-2xl !text-3xl !ring-white/30 sm:!h-28 sm:!w-28 sm:!text-4xl"
            />
            <span className="absolute bottom-2 left-0 right-0 z-[1] text-center text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              Foto
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        </div>

        {/* Identidade + badges */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[11px]">
              Semana {currentWeek} · Temporada {currentSeason}
              {team?.arena?.name ? ` · ${arenaName}` : ''}
            </p>
            <div className="mt-1 flex flex-wrap items-end gap-3">
              <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl lg:text-[2.75rem]">
                {playerName}
              </h1>
              <span
                className="mb-0.5 font-display text-3xl font-black tabular-nums leading-none sm:text-4xl"
                style={{ color: secondary }}
              >
                <CountUp value={overall ?? 0} />
              </span>
            </div>
            <p className="mt-1.5 truncate text-sm text-white/75">
              {team?.name ?? 'Free Agent'}
              {injury ? ` · ${injury.label}` : ''}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {arch ? (
                <HeroBadge tone="gold">{arch.label}</HeroBadge>
              ) : null}
              <HeroBadge tone="ice">{position}</HeroBadge>
              {isRookie ? <HeroBadge tone="live">Rookie</HeroBadge> : null}
              {!isRookie ? (
                <HeroBadge tone="ice">Ano {currentSeason}</HeroBadge>
              ) : null}
            </div>
          </div>

          {/* Strip ESPN — desempenho / sequência / recorde */}
          <div className="mt-3 flex flex-wrap items-stretch gap-2">
            <HeroStat
              label="Último jogo"
              value={
                lastPerf
                  ? `${lastPerf.points}/${lastPerf.rebounds}/${lastPerf.assists}`
                  : '—'
              }
              hint={
                lastPerf
                  ? `${lastPerf.result} ${lastPerf.score}`
                  : 'Sem partida'
              }
            />
            <HeroStat label="Sequência" value={streak.label} hint={streak.hint} />
            <HeroStat
              label="Recorde"
              value={`${record.wins}-${record.losses}`}
              hint={team?.short ?? 'Time'}
            />
            <HeroStat
              label="Energia"
              value={status?.energia ?? 0}
              hint={`Mot. ${status?.motivacao ?? 0}`}
              countUp
            />
          </div>
        </div>

        {/* CTA */}
        <div className="hidden w-[11.5rem] shrink-0 flex-col justify-end gap-2 sm:flex lg:w-[13rem]">
          {!ctaDisabled && selectedActivityLabel ? (
            <p className="text-right text-[10px] text-white/65">
              Atividade:{' '}
              <span className="font-semibold text-white">
                {selectedActivityLabel}
              </span>
            </p>
          ) : null}
          <Button
            variant="accent"
            size="lg"
            className="w-full !rounded-xl"
            onClick={onCta}
            disabled={ctaDisabled}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      {/* CTA mobile */}
      <div className="absolute bottom-3 right-3 sm:hidden">
        <Button
          variant="accent"
          size="md"
          className="!rounded-xl !px-4"
          onClick={onCta}
          disabled={ctaDisabled}
        >
          {ctaLabel}
        </Button>
      </div>
    </FadeIn>
  )
}

function HeroBadge({ children, tone = 'ice' }) {
  const tones = {
    gold: 'bg-amber-400/20 text-amber-200 ring-amber-300/35',
    ice: 'bg-white/10 text-white/90 ring-white/20',
    live: 'bg-sky-400/20 text-sky-100 ring-sky-300/35',
  }
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset',
        tones[tone] ?? tones.ice,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

function HeroStat({ label, value, hint, countUp = false }) {
  return (
    <div className="min-w-[4.75rem] rounded-lg bg-black/35 px-2.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm sm:min-w-[5.5rem] sm:px-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg font-extrabold tabular-nums leading-none sm:text-xl">
        {countUp && typeof value === 'number' ? <CountUp value={value} /> : value}
      </p>
      {hint ? (
        <p className="mt-0.5 truncate text-[10px] text-white/55">{hint}</p>
      ) : null}
    </div>
  )
}

function formatStreak(record) {
  const streak = record?.streak ?? 0
  const label = record?.streakLabel ?? '—'
  if (!streak) {
    return { label: label === '—' ? '0' : label, hint: 'Sem sequência' }
  }
  if (streak > 0) {
    return {
      label: `${streak}V`,
      hint: streak >= 3 ? 'Em alta' : 'Vitórias',
    }
  }
  return {
    label: `${Math.abs(streak)}D`,
    hint: 'Derrotas',
  }
}

function getLastPerformance({
  results = [],
  weekResults = [],
  teamId,
  playerId,
  playerName,
}) {
  const pool = [...(results ?? []), ...(weekResults ?? [])]
  if (!pool.length || !teamId) return null

  const seen = new Set()
  const unique = []
  for (let i = pool.length - 1; i >= 0; i--) {
    const g = pool[i]
    const key = g.gameId ?? `${g.week}-${g.homeId}-${g.awayId}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(g)
  }

  const game = unique.find(
    (g) => g.homeId === teamId || g.awayId === teamId,
  )
  if (!game) return null

  const line =
    (game.boxSummary ?? []).find((l) => l.playerId === playerId) ??
    (game.boxSummary ?? []).find(
      (l) =>
        l.teamId === teamId &&
        String(l.playerName ?? '')
          .toLowerCase()
          .includes(String(playerName ?? '').toLowerCase().slice(0, 4)),
    ) ??
    (game.boxSummary ?? []).find((l) => l.teamId === teamId)

  const won = game.winnerId === teamId
  const score =
    game.homeId === teamId
      ? `${game.homeScore}–${game.awayScore}`
      : `${game.awayScore}–${game.homeScore}`

  return {
    points: line?.points ?? 0,
    rebounds: line?.rebounds ?? 0,
    assists: line?.assists ?? 0,
    result: won ? 'V' : 'D',
    score,
  }
}
