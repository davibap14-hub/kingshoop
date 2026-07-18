/**
 * Story Engine — experiência visual novel (Interface only).
 * Inspirado em NBA 2K MyCareer.
 */

import { motion, useReducedMotion } from 'framer-motion'
import { gameService } from '../../services/gameService'
import { useGameStore } from '../../store/useGameStore'
import {
  FadeIn,
  Pulse,
  SlideUp,
  SlideUpItem,
} from '../motion'
import { Avatar, Badge } from '../ui'
import StoryIllustration from './StoryIllustration'
import StoryTimeline from './StoryTimeline'
import { getThemeArt } from './themeArt'

function formatEffect(key, value) {
  const sign = value > 0 ? '+' : ''
  if (key === 'dinheiro') {
    return `${sign}$${Math.abs(value).toLocaleString('en-US')}`
  }
  return `${sign}${value}`
}

export default function StoryVisualNovel() {
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const lastEventResult = useGameStore((s) => s.lastEventResult)
  const story = useGameStore((s) => s.story)
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice)

  const view = gameService.getStoryView({
    story,
    pendingEvent,
    lastEventResult,
  })
  const novel = view.novel

  if (!novel) return null

  if (novel.mode === 'active' && novel.episode) {
    return (
      <ActiveEpisode
        episode={novel.episode}
        onChoose={resolveEventChoice}
      />
    )
  }

  if (novel.mode === 'resolved' && novel.result) {
    return (
      <ResolvedEpisode
        result={novel.result}
        openChains={novel.openChains}
      />
    )
  }

  return <IdleCareerStory novel={novel} />
}

function ActiveEpisode({ episode, onChoose }) {
  const art = getThemeArt(episode.artKey)
  const reduce = useReducedMotion()

  return (
    <FadeIn
      as="article"
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1524] text-white shadow-hero"
    >
      {/* Hero cinematic */}
      <div className="relative">
        <StoryIllustration
          themeId={episode.artKey}
          title={episode.title}
          chapterLabel={episode.chapterLabel}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Pulse active color={art.accent}>
            <Badge
              tone="warning"
              className="!bg-black/50 !text-amber-200 !ring-amber-300/40"
            >
              {episode.themeLabel}
            </Badge>
          </Pulse>
          {episode.isContinuation ? (
            <Badge className="!bg-sky-500/20 !text-sky-100 !ring-sky-300/30">
              Continuação
            </Badge>
          ) : (
            <Badge className="!bg-white/10 !text-white/80 !ring-white/20">
              Nova cadeia
            </Badge>
          )}
          <Badge className="!bg-rose-500/25 !text-rose-100 !ring-rose-300/35">
            Escolha obrigatória
          </Badge>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        {/* Título gigante */}
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
            MyCareer · Story Engine · {episode.chapterLabel}
          </p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {episode.title}
          </h2>
          {episode.context ? (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
              {episode.context}
            </p>
          ) : null}
          {episode.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
              {episode.description}
            </p>
          ) : null}
          {episode.continuation ? (
            <p className="mt-3 text-sm font-semibold text-amber-200/90">
              {episode.continuation}
            </p>
          ) : null}
        </motion.header>

        {/* Personagens */}
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Personagens envolvidos
          </p>
          <div className="flex flex-wrap gap-3">
            {episode.cast.map((c, i) => (
              <motion.div
                key={c.id}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <Avatar
                  name={c.name === 'Você' ? 'My Player' : c.name}
                  size="md"
                  className="!ring-white/20"
                />
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    {c.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Consequências + recompensas previstas */}
        <div className="grid gap-4 lg:grid-cols-2">
          <StakesPanel
            title="Consequências previstas"
            items={episode.stakes.consequences}
            mode="range"
          />
          <StakesPanel
            title="Recompensas possíveis"
            items={episode.stakes.rewards}
            mode="reward"
          />
        </div>

        {/* Timeline */}
        <StoryTimeline chapters={episode.chapters} />

        {/* Escolhas grandes */}
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Sua decisão
          </p>
          <SlideUp stagger className="grid gap-4 lg:grid-cols-2">
            {episode.choices.map((choice) => (
              <SlideUpItem key={choice.id}>
                <ChoiceCard
                  choice={choice}
                  accent={art.accent}
                  onChoose={() => onChoose(choice.id)}
                />
              </SlideUpItem>
            ))}
          </SlideUp>
        </section>
      </div>
    </FadeIn>
  )
}

function ChoiceCard({ choice, accent, onChoose }) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onChoose}
      whileHover={reduce ? undefined : { y: -4, scale: 1.01 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      className="group flex h-full w-full flex-col rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] p-5 text-left shadow-lg transition-colors hover:border-amber-300/40 hover:bg-white/[0.12]"
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.25)`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: accent }}
      >
        {choice.continues ? 'Continua o arco' : 'Pode encerrar o arco'}
      </span>
      <span className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl">
        {choice.label}
      </span>
      {choice.texto ? (
        <span className="mt-2 text-sm text-white/65">{choice.texto}</span>
      ) : null}

      {choice.rewards.length ? (
        <div className="mt-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300/80">
            Recompensas
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {choice.rewards.map((r) => (
              <span
                key={`r-${r.key}`}
                className="rounded-md bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-300/25"
              >
                {r.label} {formatEffect(r.key, r.value)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {choice.risks.length ? (
        <div className="mt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-rose-300/80">
            Consequências
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {choice.risks.map((r) => (
              <span
                key={`k-${r.key}`}
                className="rounded-md bg-rose-400/15 px-2 py-1 text-[11px] font-semibold text-rose-200 ring-1 ring-rose-300/25"
              >
                {r.label} {formatEffect(r.key, r.value)}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200/90">
        Escolher este caminho
        <span className="transition group-hover:translate-x-1">→</span>
      </span>
    </motion.button>
  )
}

function StakesPanel({ title, items, mode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-white/50">Nenhum efeito listado.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-white/75">{item.label}</span>
              <span className="font-display text-base font-bold tabular-nums text-white">
                {mode === 'range'
                  ? `${formatEffect(item.key, item.min)} → ${formatEffect(item.key, item.max)}`
                  : formatEffect(item.key, item.max)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ResolvedEpisode({ result, openChains }) {
  return (
    <FadeIn className="overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#0b1f33] via-[#123524] to-[#0b1524] p-5 text-white shadow-hero sm:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/90">
        Capítulo resolvido · {result.categoria}
      </p>
      <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
        {result.title}
      </h2>
      {result.continuation ? (
        <p className="mt-3 text-sm text-emerald-100/80">{result.continuation}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(result.deltas || {})
          .filter(([, v]) => v)
          .map(([key, value]) => (
            <span
              key={key}
              className={[
                'rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1',
                value > 0
                  ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/30'
                  : 'bg-rose-400/15 text-rose-200 ring-rose-300/30',
              ].join(' ')}
            >
              {key} {formatEffect(key, value)}
            </span>
          ))}
      </div>
      {openChains?.length ? (
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Cadeias ainda abertas na carreira
          </p>
          <OpenChainsList chains={openChains} />
        </div>
      ) : null}
    </FadeIn>
  )
}

function IdleCareerStory({ novel }) {
  const hasChains = novel.openChains?.length > 0
  const hasRecent = novel.recent?.length > 0

  if (!hasChains && !hasRecent && !novel.counts?.resolved) {
    return (
      <FadeIn className="rounded-2xl border border-white/10 bg-[#0b1524] p-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
          MyCareer · Story Engine
        </p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Sua história ainda vai começar
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-white/65">
          Avance a semana — conflitos de vestiário, cobranças do técnico,
          holofotes da cidade e arcos de liga vão surgir como capítulos da sua
          carreira.
        </p>
      </FadeIn>
    )
  }

  return (
    <FadeIn className="space-y-5 rounded-2xl border border-white/10 bg-[#0b1524] p-5 text-white sm:p-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
          MyCareer · Arcos em andamento
        </p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Vivendo a carreira
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {novel.counts?.open ?? 0} cadeia(s) aberta(s) ·{' '}
          {novel.counts?.resolved ?? 0} capítulo(s) resolvido(s)
        </p>
      </header>

      {hasChains ? (
        <div className="space-y-4">
          {novel.openChains.map((chain) => (
            <div
              key={chain.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                <StoryIllustration
                  themeId={chain.theme}
                  title={chain.title}
                  chapterLabel={`Cap. ${chain.stage + 1}/${chain.maxStages}`}
                  className="!h-[160px] sm:!h-full sm:min-h-[180px]"
                />
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="!bg-amber-400/15 !text-amber-200 !ring-amber-300/30">
                      {chain.themeLabel}
                    </Badge>
                    {chain.dueWeek != null ? (
                      <Badge className="!bg-white/10 !text-white/70 !ring-white/15">
                        Retorna sem. {chain.dueWeek}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">
                    {chain.title}
                  </h3>
                  <StoryTimeline
                    chapters={chain.chapters}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {hasRecent ? (
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Capítulos recentes da carreira
          </p>
          <ul className="space-y-2">
            {novel.recent.map((h, i) => (
              <li
                key={`${h.storyId ?? h.chainId}-${i}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  T{h.season} · Sem {h.week}
                  {h.continued ? ' · Continua' : ' · Encerrado'}
                </p>
                <p className="mt-1 font-display text-lg font-bold uppercase">
                  {h.title}
                </p>
                <p className="text-sm text-white/65">
                  Escolha: {h.choiceLabel}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </FadeIn>
  )
}

function OpenChainsList({ chains }) {
  return (
    <ul className="space-y-2">
      {chains.map((c) => (
        <li
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
        >
          <span className="font-display text-base font-bold uppercase">
            {c.title}
          </span>
          <span className="text-[11px] text-white/55">
            Cap. {c.stage + 1}/{c.maxStages} · {c.themeLabel}
          </span>
        </li>
      ))}
    </ul>
  )
}
