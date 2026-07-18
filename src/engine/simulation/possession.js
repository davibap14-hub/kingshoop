import { CHEMISTRY_SIM_WEIGHTS } from '../../data/chemistry'
import { PLAY_ACTIONS } from '../../data/simulation/constants'
import { boostToScoreFactor } from '../chemistry/effects'
import {
  adaptDefenseToSet,
  decideDefensiveScheme,
} from '../defense'
import {
  buildPossessionDecisionContext,
  decideBallHandler,
  decideCutter,
  decideDuel,
  decideHelpDefender,
  decidePrimaryDefender,
  decideReceiver,
  decideScreener,
  decideStealer,
} from '../decision'
import {
  chooseFinishStyle,
  chooseOffensiveSet,
  resolveOnBallPressure,
  resolveRebound,
  resolveShot,
} from './actions'
import { attr, combineScore, contestedSelect, tendency, weightedSelect } from './weights'
import { formatPbpEvent } from './playbyplay'

const CHEMISTRY_PASS_W = CHEMISTRY_SIM_WEIGHTS.pass

/**
 * Simula uma posse completa com ações, atributos e tendências.
 * Retorna resultado estatístico + eventos de Play-by-Play.
 */
export function simulatePossessionDetailed({
  offensePlayers,
  defensePlayers,
  offenseTeam,
  defenseTeam,
  quarter,
  homeScore,
  awayScore,
  offenseIsHome,
  context = {},
  rng = Math.random,
}) {
  const events = []
  const clock = context.clockLabel ?? `Q${quarter}`

  const push = (partial) => {
    events.push(
      formatPbpEvent({
        quarter,
        clock,
        homeScore,
        awayScore,
        offenseTeam,
        defenseTeam,
        ...partial,
      }),
    )
  }

  // —— Decision Engine: contexto ponderado da posse ——
  const decisionCtx = buildPossessionDecisionContext({
    offensePlayers,
    defensePlayers,
    offenseTeam,
    defenseTeam,
    quarter,
    homeScore,
    awayScore,
    offenseIsHome,
    context,
    possessionIndex: context.possessionIndex ?? 0,
    possessionsThisQuarter: context.possessionsThisQuarter ?? 24,
  })

  const chemistryEffects = decisionCtx.chemistryEffects
  const defChemistryEffects = decisionCtx.defenseChemistryEffects

  // Quem arma · quem marca · quem contesta (Decision Engine)
  const ballHandler = decideBallHandler(offensePlayers, decisionCtx, rng)
  push({
    action: PLAY_ACTIONS.ball_handler,
    text: `${ballHandler.nome} inicia a posse com a bola.`,
    actors: { ballHandler: ballHandler.nome },
  })

  const defender = decidePrimaryDefender(
    defensePlayers,
    ballHandler,
    decisionCtx,
    rng,
  )
  const help = decideHelpDefender(defensePlayers, defender, decisionCtx, rng)
  push({
    action: PLAY_ACTIONS.individual_defense,
    text: `${defender.nome} marca ${ballHandler.nome} no perímetro.`,
    actors: { defender: defender.nome, ballHandler: ballHandler.nome },
  })

  // Defensive Engine — esquema coletivo reage à ameaça ofensiva
  let defensePlan = decideDefensiveScheme({
    defensePlayers,
    offensePlayers,
    ballHandler,
    ctx: {
      ...decisionCtx,
      allowFastBreak: Boolean(decisionCtx.allowFastBreak),
      coach: context.defenseCoach ?? context.coach ?? decisionCtx.coach,
    },
    coach: context.defenseCoach ?? null,
    defenseBias:
      context.defenseBias ??
      context.defenseCoach?.defenseBias ??
      decisionCtx.defenseBias,
    rng,
  })
  push({
    action: PLAY_ACTIONS.defensive_scheme,
    text: `Defesa: ${defensePlan.label}.`,
    actors: { defender: defender.nome },
  })

  const pack = (payload) =>
    packResult({
      ...payload,
      defenseScheme: defensePlan?.scheme ?? payload.defenseScheme ?? null,
    })

  const pressure = resolveOnBallPressure({
    ballHandler,
    defender,
    helpDefender: help,
    isHome: offenseIsHome,
    chemistry: decisionCtx.chemistry,
    chemistryEffects,
    pressure: decisionCtx.pressure,
    importance: decisionCtx.importance,
    fatigue: decisionCtx.fatigue,
    momentum: decisionCtx.momentum,
    defenseEffects: defensePlan.effects,
    rng,
  })

  if (pressure.helpCommitted) {
    const helpLabel =
      defensePlan.scheme === 'double_team'
        ? 'dobra'
        : defensePlan.scheme === 'trap'
          ? 'trap'
          : 'ajuda'
    push({
      action: PLAY_ACTIONS.help_defense,
      text: `${help.nome} vem na ${helpLabel} sobre ${ballHandler.nome} (${defensePlan.label}).`,
      actors: { help: help.nome, ballHandler: ballHandler.nome },
    })
  }

  if (pressure.winner === 'defense') {
    const stealer = decideStealer(
      defensePlayers,
      ballHandler,
      defender,
      decisionCtx,
      rng,
    )
    const stealScore = combineScore([
      { value: attr(stealer, 'defesa.roubo'), weight: 1.3 },
      { value: pressure.defenseScore * 100, weight: 0.9, scale: 100 },
      { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 0.8, invert: true },
      { value: decisionCtx.pressure, weight: 0.35 },
      { value: decisionCtx.fatigue, weight: 0.3, invert: true },
      {
        value: (defensePlan.effects?.stealScore ?? 50) *
          (defensePlan.effects?.stealMult ?? 1),
        weight: defensePlan.effects?.gamblesSteal ? 1.0 : 0.65,
      },
    ])
    const holdScore = combineScore([
      { value: pressure.attackScore * 100, weight: 1.0, scale: 100 },
      { value: tendency(ballHandler, 'pass'), weight: 0.7 },
      { value: attr(ballHandler, 'qi.passe'), weight: 0.8 },
      { value: attr(ballHandler, 'fisico.forca'), weight: 0.45 },
      {
        value: chemistryEffects?.teamChemistry ?? decisionCtx.chemistry,
        weight: CHEMISTRY_SIM_WEIGHTS.onBallPressure,
      },
      { value: decisionCtx.momentum, weight: 0.35 },
    ])
    const stealDuel = decideDuel(
      'steal_duel',
      stealScore,
      holdScore,
      decisionCtx,
      rng,
    )
    if (stealDuel.winner === 'a') {
      push({
        action: PLAY_ACTIONS.individual_defense,
        text: `Roubo de ${stealer.nome}! (${defensePlan.label})`,
        actors: { stealer: stealer.nome },
      })
      return pack({
        outcome: 'steal',
        points: 0,
        stealerId: stealer.id,
        turnoversById: ballHandler.id,
        events,
        keepsPossession: false,
        transitionNext: true,
      })
    }

    const toDuel = decideDuel(
      'pressure_turnover',
      combineScore([
        { value: pressure.defenseScore * 100, weight: 1, scale: 100 },
        { value: 48, weight: 0.5 },
        { value: decisionCtx.pressure, weight: 0.4 },
        {
          value: (defensePlan.effects?.raw?.turnoverForce ?? 50) *
            (defensePlan.effects?.turnoverMult ?? 1),
          weight: 0.7,
        },
      ]),
      combineScore([
        { value: pressure.attackScore * 100, weight: 1, scale: 100 },
        { value: tendency(ballHandler, 'pass'), weight: 0.6 },
        { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 0.8 },
        { value: decisionCtx.fatigue, weight: 0.35, invert: true },
      ]),
      decisionCtx,
      rng,
    )
    if (toDuel.winner === 'a') {
      push({
        action: PLAY_ACTIONS.ball_handler,
        text: `Turnover de ${ballHandler.nome} sob pressão.`,
        actors: { ballHandler: ballHandler.nome },
      })
      return pack({
        outcome: 'turnover',
        points: 0,
        turnoversById: ballHandler.id,
        events,
        keepsPossession: false,
        transitionNext: true,
      })
    }
  }

  const set = chooseOffensiveSet({
    offensePlayers,
    ballHandler,
    context: {
      ...decisionCtx,
      allowFastBreak: Boolean(decisionCtx.allowFastBreak),
      transitionDefense:
        combineScore(
          defensePlayers.map((p) => ({
            value: attr(p, 'fisico.velocidade'),
            weight: 1,
          })),
        ) * 100,
      chemistryEffects,
      coachSetBias: decisionCtx.coachSetBias,
      playbook: decisionCtx.playbook,
      matchup: decisionCtx.matchup,
    },
    rng,
  })

  // Defensive Engine — adapta cobertura ao set ofensivo real
  defensePlan = adaptDefenseToSet(
    defensePlan,
    set,
    {
      ...decisionCtx,
      coach: context.defenseCoach ?? decisionCtx.coach,
    },
    rng,
  )
  if (defensePlan.adapted && defensePlan.previousScheme) {
    push({
      action: PLAY_ACTIONS.defensive_scheme,
      text: `Ajuste defensivo: ${defensePlan.label} contra ${set?.id ?? 'ataque'}.`,
      actors: { defender: defender.nome },
    })
  }

  const setId = set?.id ?? 'isolation'
  const calledPlay = set?.meta?.play ?? null
  if (calledPlay?.name) {
    push({
      action: 'play_call',
      text: `Playbook: ${calledPlay.name} (${calledPlay.category}) — 1ª opção: ${calledPlay.firstOption}.`,
      actors: { ballHandler: ballHandler.nome },
    })
  }

  let shooter = ballHandler
  let assister = null
  let openLook = pressure.winner === 'offense' && !pressure.helpCommitted
  let shotType = 'two'
  let finishAction = null
  let screener = null
  let activeHelp = pressure.helpCommitted ? help : null

  if (setId === 'fast_break') {
    push({
      action: PLAY_ACTIONS.fast_break,
      text: `Contra-ataque! ${ballHandler.nome} em transição (tend. Fast Break ${tendency(ballHandler, 'fastBreak')}).`,
      actors: { ballHandler: ballHandler.nome },
    })

    const fbFinish = chooseFinishStyle({
      shooter: ballHandler,
      context: {
        allowThree: tendency(ballHandler, 'shoot3') >= 55,
        preferInside: true,
        allowAlleyOop: false,
      },
      rng,
    })
    shooter = ballHandler
    shotType = fbFinish.shotType === 'three' ? 'three' : 'layup'
    finishAction = fbFinish.action
    openLook = true
  } else if (setId === 'pick_and_roll') {
    screener = decideScreener(offensePlayers, ballHandler, decisionCtx, rng)
    const pairScreen =
      chemistryEffects?.pairScoreBetween?.(ballHandler.id, screener.id) ?? 50
    push({
      action: PLAY_ACTIONS.screen,
      text: `${screener.nome} oferece screen para ${ballHandler.nome}.`,
      actors: { screener: screener.nome, ballHandler: ballHandler.nome },
    })
    push({
      action: PLAY_ACTIONS.pick_and_roll,
      text: `Pick and Roll: ${ballHandler.nome} usa o bloqueio de ${screener.nome}.`,
      actors: { ballHandler: ballHandler.nome, screener: screener.nome },
    })

    const branch = weightedSelect(
      [
        {
          id: 'roll',
          score: combineScore([
            { value: tendency(screener, 'alleyOop'), weight: 0.7 },
            { value: tendency(screener, 'postUp'), weight: 0.5 },
            { value: attr(screener, 'arremesso.bandeja'), weight: 0.9 },
            { value: tendency(ballHandler, 'pass'), weight: 1.1 },
            { value: pairScreen, weight: CHEMISTRY_PASS_W },
          ]),
        },
        {
          id: 'pull',
          score: combineScore([
            { value: tendency(ballHandler, 'shoot3'), weight: 1.2 },
            { value: tendency(ballHandler, 'stepBack'), weight: 0.9 },
            { value: attr(ballHandler, 'arremesso.tresPontos'), weight: 0.7 },
          ]),
        },
        {
          id: 'drive',
          score: combineScore([
            { value: tendency(ballHandler, 'drive'), weight: 1.4 },
            { value: attr(ballHandler, 'fisico.velocidade'), weight: 0.9 },
          ]),
        },
        {
          id: 'kick',
          score: combineScore([
            { value: tendency(ballHandler, 'pass'), weight: 1.4 },
            { value: pressure.helpCommitted ? 80 : 42, weight: 0.9 },
            {
              value: boostToScoreFactor(chemistryEffects?.passBoost),
              weight: CHEMISTRY_PASS_W,
            },
          ]),
        },
        {
          id: 'alley',
          score: combineScore([
            { value: tendency(screener, 'alleyOop'), weight: 1.5 },
            { value: tendency(ballHandler, 'pass'), weight: 1.2 },
            { value: attr(screener, 'fisico.impulsao'), weight: 0.9 },
            { value: pairScreen, weight: CHEMISTRY_PASS_W },
          ]),
        },
      ],
      rng,
    )?.id

    if (branch === 'alley') {
      shooter = screener
      assister = ballHandler
      shotType = 'alley_oop'
      finishAction = 'alley_oop'
      openLook = true
      push({
        action: PLAY_ACTIONS.alley_oop,
        text: `Alley Oop! ${ballHandler.nome} lança para ${screener.nome}.`,
        actors: { ballHandler: ballHandler.nome, screener: screener.nome },
      })
    } else if (branch === 'roll') {
      shooter = screener
      assister = ballHandler
      shotType = 'layup'
      openLook = true
      push({
        action: PLAY_ACTIONS.pick_and_roll,
        text: `${ballHandler.nome} encontra ${screener.nome} no roll.`,
        actors: { ballHandler: ballHandler.nome, screener: screener.nome },
      })
    } else if (branch === 'kick') {
      const kickTo = decideReceiver(
        offensePlayers,
        ballHandler,
        decisionCtx,
        rng,
      )
      push({
        action: PLAY_ACTIONS.kick_out,
        text: `Kick out de ${ballHandler.nome} para ${kickTo.nome} (tend. Pass ${tendency(ballHandler, 'pass')}).`,
        actors: { ballHandler: ballHandler.nome, receiver: kickTo.nome },
      })
      shooter = kickTo
      assister = ballHandler
      const kickFinish = chooseFinishStyle({
        shooter: kickTo,
        context: { allowThree: true, preferInside: false },
        rng,
      })
      shotType = kickFinish.shotType
      finishAction = kickFinish.action
      openLook = Boolean(pressure.helpCommitted)
    } else if (branch === 'drive') {
      push({
        action: PLAY_ACTIONS.drive,
        text: `${ballHandler.nome} ataca o garrafão após o screen.`,
        actors: { ballHandler: ballHandler.nome },
      })
      shooter = ballHandler
      shotType = 'layup'
    } else {
      const pull = chooseFinishStyle({
        shooter: ballHandler,
        context: { allowThree: true, preferInside: false },
        rng,
      })
      shooter = ballHandler
      shotType = pull.shotType
      finishAction = pull.action
      if (finishAction === 'step_back') {
        push({
          action: PLAY_ACTIONS.step_back,
          text: `Step Back de ${ballHandler.nome}.`,
          actors: { shooter: ballHandler.nome },
        })
      }
    }
  } else if (setId === 'isolation') {
    push({
      action: PLAY_ACTIONS.isolation,
      text: `Isolation: ${ballHandler.nome} vs ${defender.nome} (tend. Iso ${tendency(ballHandler, 'isolation')}).`,
      actors: { ballHandler: ballHandler.nome, defender: defender.nome },
    })

    const isoBranch = weightedSelect(
      [
        {
          id: 'drive',
          score: combineScore([
            { value: tendency(ballHandler, 'drive'), weight: 1.4 },
            { value: attr(ballHandler, 'fisico.velocidade'), weight: 0.8 },
          ]),
        },
        {
          id: 'step_back',
          score: combineScore([
            { value: tendency(ballHandler, 'stepBack'), weight: 1.45 },
            { value: tendency(ballHandler, 'shoot3'), weight: 0.7 },
          ]),
        },
        {
          id: 'fadeaway',
          score: combineScore([
            { value: tendency(ballHandler, 'fadeaway'), weight: 1.45 },
            { value: attr(ballHandler, 'arremesso.midRange'), weight: 0.8 },
          ]),
        },
        {
          id: 'jumper',
          score: combineScore([
            { value: tendency(ballHandler, 'shoot3'), weight: 1.2 },
            { value: attr(ballHandler, 'arremesso.tresPontos'), weight: 0.8 },
          ]),
        },
      ],
      rng,
    )?.id

    shooter = ballHandler
    if (isoBranch === 'drive') {
      push({
        action: PLAY_ACTIONS.drive,
        text: `${ballHandler.nome} acelera em drive.`,
        actors: { ballHandler: ballHandler.nome },
      })
      shotType = 'layup'
    } else if (isoBranch === 'step_back') {
      push({
        action: PLAY_ACTIONS.step_back,
        text: `Step Back de ${ballHandler.nome}.`,
        actors: { shooter: ballHandler.nome },
      })
      shotType = 'step_back'
      finishAction = 'step_back'
    } else if (isoBranch === 'fadeaway') {
      push({
        action: PLAY_ACTIONS.fadeaway,
        text: `Fadeaway de ${ballHandler.nome}.`,
        actors: { shooter: ballHandler.nome },
      })
      shotType = 'fadeaway'
      finishAction = 'fadeaway'
    } else {
      shotType =
        tendency(ballHandler, 'shoot3') >= tendency(ballHandler, 'fadeaway')
          ? 'three'
          : 'two'
    }
  } else if (setId === 'drive') {
    push({
      action: PLAY_ACTIONS.drive,
      text: `${ballHandler.nome} inicia o drive (tend. Drive ${tendency(ballHandler, 'drive')}).`,
      actors: { ballHandler: ballHandler.nome },
    })

    if (pressure.helpCommitted) {
      const kickTo = decideReceiver(
        offensePlayers,
        ballHandler,
        decisionCtx,
        rng,
      )
      const kickDuel = contestedSelect(
        combineScore([
          { value: tendency(ballHandler, 'pass'), weight: 1.4 },
          { value: attr(ballHandler, 'qi.visao'), weight: 1.0 },
          { value: attr(ballHandler, 'qi.passe'), weight: 0.9 },
          {
            value:
              chemistryEffects?.pairScoreBetween?.(ballHandler.id, kickTo.id) ??
              50,
            weight: CHEMISTRY_PASS_W,
          },
        ]),
        combineScore([
          { value: attr(help, 'defesa.roubo'), weight: 0.9 },
          { value: attr(help, 'qi.tomadaDecisao'), weight: 0.8 },
        ]),
        rng,
      )
      if (kickDuel.winner === 'a') {
        push({
          action: PLAY_ACTIONS.kick_out,
          text: `Kick out de ${ballHandler.nome} para ${kickTo.nome} (ajuda comprometida).`,
          actors: { ballHandler: ballHandler.nome, receiver: kickTo.nome },
        })
        shooter = kickTo
        assister = ballHandler
        const kickFinish = chooseFinishStyle({
          shooter: kickTo,
          context: { allowThree: true },
          rng,
        })
        shotType = kickFinish.shotType
        finishAction = kickFinish.action
        openLook = true
        activeHelp = null
      } else {
        shooter = ballHandler
        shotType = 'layup'
        openLook = false
        activeHelp = help
      }
    } else {
      shooter = ballHandler
      shotType = 'layup'
      openLook = true
    }
  } else if (setId === 'post_up') {
    const post = set.meta?.postPlayer ?? ballHandler
    push({
      action: PLAY_ACTIONS.post_up,
      text: `Post Up: ${post.nome} recebe no garrafão (tend. ${tendency(post, 'postUp')}).`,
      actors: { post: post.nome },
    })
    shooter = post
    assister = post.id !== ballHandler.id ? ballHandler : null

    const postFinish = chooseFinishStyle({
      shooter: post,
      context: { allowThree: false, allowPost: true, preferInside: true },
      rng,
    })
    if (postFinish.id === 'fadeaway') {
      push({
        action: PLAY_ACTIONS.fadeaway,
        text: `Fadeaway no post de ${post.nome}.`,
        actors: { shooter: post.nome },
      })
      shotType = 'fadeaway'
      finishAction = 'fadeaway'
    } else {
      shotType = 'post'
    }
    openLook = pressure.winner === 'offense'
  } else if (setId === 'cut') {
    screener = decideScreener(offensePlayers, ballHandler, decisionCtx, rng)
    const cutter = decideCutter(
      offensePlayers,
      ballHandler,
      screener,
      decisionCtx,
      rng,
    )
    push({
      action: PLAY_ACTIONS.screen,
      text: `${screener.nome} bloqueia para liberar corte.`,
      actors: { screener: screener.nome },
    })
    push({
      action: PLAY_ACTIONS.cut,
      text: `${cutter.nome} corta à cesta; ${ballHandler.nome} procura o passe (tend. Pass ${tendency(ballHandler, 'pass')}).`,
      actors: { cutter: cutter.nome, ballHandler: ballHandler.nome },
    })

    const cutDuel = contestedSelect(
      combineScore([
        { value: tendency(ballHandler, 'pass'), weight: 1.3 },
        { value: attr(ballHandler, 'qi.passe'), weight: 1.0 },
        { value: attr(cutter, 'fisico.velocidade'), weight: 1.0 },
        { value: tendency(cutter, 'alleyOop'), weight: 0.5 },
        {
          value:
            chemistryEffects?.pairScoreBetween?.(ballHandler.id, cutter.id) ??
            50,
          weight: CHEMISTRY_PASS_W,
        },
        {
          value: boostToScoreFactor(chemistryEffects?.movementBoost),
          weight: CHEMISTRY_SIM_WEIGHTS.movement,
        },
      ]),
      combineScore([
        { value: attr(defender, 'defesa.garrafao'), weight: 1.0 },
        { value: attr(help, 'qi.tomadaDecisao'), weight: 0.9 },
      ]),
      rng,
    )

    if (cutDuel.winner === 'a') {
      const alleyDuel = contestedSelect(
        combineScore([
          { value: tendency(cutter, 'alleyOop'), weight: 1.3 },
          { value: tendency(ballHandler, 'pass'), weight: 1.0 },
        ]),
        0.58,
        rng,
      )
      if (alleyDuel.winner === 'a') {
        push({
          action: PLAY_ACTIONS.alley_oop,
          text: `Alley Oop no corte: ${ballHandler.nome} → ${cutter.nome}.`,
          actors: { ballHandler: ballHandler.nome, cutter: cutter.nome },
        })
        shooter = cutter
        assister = ballHandler
        shotType = 'alley_oop'
        finishAction = 'alley_oop'
        openLook = true
      } else {
        shooter = cutter
        assister = ballHandler
        shotType = 'layup'
        openLook = true
      }
    } else {
      const salvage = chooseFinishStyle({
        shooter: ballHandler,
        context: { allowThree: true },
        rng,
      })
      shooter = ballHandler
      shotType = salvage.shotType
      finishAction = salvage.action
      openLook = false
    }
  }

  const resolvedShotType =
    finishAction === 'step_back'
      ? 'step_back'
      : finishAction === 'fadeaway'
        ? 'fadeaway'
        : shotType

  const shot = resolveShot({
    shooter,
    defender,
    helpDefender: activeHelp,
    shotType: resolvedShotType,
    isHome: offenseIsHome,
    openLook,
    chemistryEffects,
    assister,
    defenseEffects: defensePlan.effects,
    rng,
  })

  if (shot.outcome === 'block') {
    const blocker = activeHelp ?? defender
    push({
      action: PLAY_ACTIONS.help_defense,
      text: `Tocó de ${blocker.nome} em ${shooter.nome}!`,
      actors: { blocker: blocker.nome, shooter: shooter.nome },
    })
    const reb = resolveRebound({
      offensePlayers,
      defensePlayers,
      isHome: offenseIsHome,
      decisionCtx,
      rng,
    })
    return finishWithRebound({
      shot,
      reb,
      shooter,
      blocker,
      events,
      push,
      packResult: pack,
    })
  }

  if (shot.outcome === 'foul') {
    push({
      action: PLAY_ACTIONS.individual_defense,
      text: `Falta de ${defender.nome} em ${shooter.nome} — lances livres.`,
      actors: { fouler: defender.nome, shooter: shooter.nome },
    })
    if (shot.points > 0) {
      push({
        action: PLAY_ACTIONS.ball_handler,
        text: `${shooter.nome} converte ${shot.points} no LL.`,
        actors: { shooter: shooter.nome },
        points: shot.points,
      })
    }
    return pack({
      outcome: 'shooting_foul',
      points: shot.points,
      scorerId: shot.points > 0 ? shooter.id : null,
      foulerId: defender.id,
      fouledId: shooter.id,
      isThree: shot.shotType === 'three',
      events,
      keepsPossession: false,
      transitionNext: false,
    })
  }

  if (shot.outcome === 'make') {
    const pts = shot.points
    const styleAction =
      finishAction === 'alley_oop'
        ? PLAY_ACTIONS.alley_oop
        : finishAction === 'step_back'
          ? PLAY_ACTIONS.step_back
          : finishAction === 'fadeaway'
            ? PLAY_ACTIONS.fadeaway
            : setId === 'fast_break'
              ? PLAY_ACTIONS.fast_break
              : PLAY_ACTIONS.drive

    const styleLabel =
      finishAction === 'alley_oop'
        ? 'Alley Oop'
        : finishAction === 'step_back'
          ? 'Step Back'
          : finishAction === 'fadeaway'
            ? 'Fadeaway'
            : null

    push({
      action: styleAction,
      text: assister
        ? `${styleLabel ? `${styleLabel}: ` : ''}Cesta de ${shooter.nome} (${pts}) — assistência de ${assister.nome}.`
        : `${styleLabel ? `${styleLabel}: ` : ''}Cesta de ${shooter.nome} (${pts}).`,
      actors: {
        shooter: shooter.nome,
        assister: assister?.nome,
      },
      points: pts,
    })
    return pack({
      outcome: pts === 3 ? 'make3' : 'make2',
      points: pts,
      scorerId: shooter.id,
      assisterId: assister?.id ?? null,
      isThree: pts === 3,
      events,
      keepsPossession: false,
      transitionNext: false,
    })
  }

  push({
    action: PLAY_ACTIONS.individual_defense,
    text: `${shooter.nome} erra o arremesso; disputa de rebote.`,
    actors: { shooter: shooter.nome },
  })

  const reb = resolveRebound({
    offensePlayers,
    defensePlayers,
    isHome: offenseIsHome,
    decisionCtx,
    rng,
  })

  return finishWithRebound({
    shot: { ...shot, outcome: 'miss' },
    reb,
    shooter,
    blocker: null,
    events,
    push,
    packResult: pack,
  })
}

function finishWithRebound({
  shot,
  reb,
  shooter,
  blocker,
  events,
  push,
  packResult,
}) {
  if (reb.type === 'offensive_rebound') {
    push({
      action: PLAY_ACTIONS.offensive_rebound,
      text: `Rebound ofensivo de ${reb.player.nome} — posse mantida!`,
      actors: { rebounder: reb.player.nome },
    })
    return packResult({
      outcome: 'orb',
      points: 0,
      scorerId: null,
      rebounderId: reb.player.id,
      blockerId: blocker?.id ?? null,
      isThree: shot.shotType === 'three',
      missedById: shooter.id,
      events,
      keepsPossession: true,
      transitionNext: false,
    })
  }

  push({
    action: PLAY_ACTIONS.help_defense,
    text: `Rebound defensivo de ${reb.player.nome}.`,
    actors: { rebounder: reb.player.nome },
  })
  return packResult({
    outcome: shot.outcome === 'block' ? 'block' : 'drb',
    points: 0,
    scorerId: null,
    rebounderId: reb.player.id,
    blockerId: blocker?.id ?? null,
    isThree: shot.shotType === 'three',
    missedById: shooter.id,
    events,
    keepsPossession: false,
    transitionNext: true,
  })
}

function packResult(payload) {
  return {
    outcome: payload.outcome,
    points: payload.points ?? 0,
    scorerId: payload.scorerId ?? null,
    assisterId: payload.assisterId ?? null,
    rebounderId: payload.rebounderId ?? null,
    stealerId: payload.stealerId ?? null,
    blockerId: payload.blockerId ?? null,
    turnoversById: payload.turnoversById ?? null,
    foulerId: payload.foulerId ?? null,
    fouledId: payload.fouledId ?? null,
    isThree: Boolean(payload.isThree),
    missedById: payload.missedById ?? null,
    keepsPossession: Boolean(payload.keepsPossession),
    transitionNext: Boolean(payload.transitionNext),
    defenseScheme: payload.defenseScheme ?? null,
    events: payload.events ?? [],
  }
}
