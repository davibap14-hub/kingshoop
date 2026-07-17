import { PLAY_ACTIONS } from '../../data/simulation/constants'
import {
  chooseOffensiveSet,
  pickBallHandler,
  pickCutter,
  pickHelpDefender,
  pickIndividualDefender,
  pickKickTarget,
  pickScreener,
  resolveOnBallPressure,
  resolveRebound,
  resolveShot,
} from './actions'
import { attr, combineScore, contestedSelect, weightedSelect } from './weights'
import { formatPbpEvent } from './playbyplay'

/**
 * Simula uma posse completa com ações e pesos combinados.
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

  // —— Ball Handler ——
  const ballHandler = pickBallHandler(offensePlayers, rng, {
    preferPerimeter: true,
  })
  push({
    action: PLAY_ACTIONS.ball_handler,
    text: `${ballHandler.nome} inicia a posse com a bola.`,
    actors: { ballHandler: ballHandler.nome },
  })

  // —— Defesa individual + ajuda ——
  const defender = pickIndividualDefender(defensePlayers, ballHandler, rng)
  const help = pickHelpDefender(defensePlayers, defender, rng)
  push({
    action: PLAY_ACTIONS.individual_defense,
    text: `${defender.nome} marca ${ballHandler.nome} no perímetro.`,
    actors: { defender: defender.nome, ballHandler: ballHandler.nome },
  })

  const pressure = resolveOnBallPressure({
    ballHandler,
    defender,
    helpDefender: help,
    isHome: offenseIsHome,
    rng,
  })

  if (pressure.helpCommitted) {
    push({
      action: PLAY_ACTIONS.help_defense,
      text: `${help.nome} vem na ajuda sobre ${ballHandler.nome}.`,
      actors: { help: help.nome, ballHandler: ballHandler.nome },
    })
  }

  // Roubo / turnover sob pressão defensiva (pesos combinados)
  if (pressure.winner === 'defense') {
    const stealScore = combineScore([
      { value: attr(defender, 'defesa.roubo'), weight: 1.3 },
      { value: pressure.defenseScore * 100, weight: 0.9, scale: 100 },
      { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 0.8, invert: true },
    ])
    const holdScore = combineScore([
      { value: pressure.attackScore * 100, weight: 1.0, scale: 100 },
      { value: attr(ballHandler, 'qi.passe'), weight: 0.9 },
      { value: attr(ballHandler, 'fisico.forca'), weight: 0.5 },
    ])
    const stealDuel = contestedSelect(stealScore, holdScore, rng)
    if (stealDuel.winner === 'a') {
      push({
        action: PLAY_ACTIONS.individual_defense,
        text: `Roubo de ${defender.nome}!`,
        actors: { stealer: defender.nome },
      })
      return packResult({
        outcome: 'steal',
        points: 0,
        stealerId: defender.id,
        turnoversById: ballHandler.id,
        events,
        keepsPossession: false,
        transitionNext: true,
      })
    }
    // força erro / turnover sem steal
    const toDuel = contestedSelect(
      combineScore([
        { value: pressure.defenseScore * 100, weight: 1, scale: 100 },
        { value: 48, weight: 0.5 },
      ]),
      combineScore([
        { value: pressure.attackScore * 100, weight: 1, scale: 100 },
        { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 0.8 },
      ]),
      rng,
    )
    if (toDuel.winner === 'a') {
      push({
        action: PLAY_ACTIONS.ball_handler,
        text: `Turnover de ${ballHandler.nome} sob pressão.`,
        actors: { ballHandler: ballHandler.nome },
      })
      return packResult({
        outcome: 'turnover',
        points: 0,
        turnoversById: ballHandler.id,
        events,
        keepsPossession: false,
        transitionNext: true,
      })
    }
  }

  // —— Escolha do set ——
  const set = chooseOffensiveSet({
    offensePlayers,
    ballHandler,
    context: {
      allowFastBreak: Boolean(context.allowFastBreak),
      transitionDefense: combineScore(
        defensePlayers.map((p) => ({
          value: attr(p, 'fisico.velocidade'),
          weight: 1,
        })),
      ) * 100,
      styleThreeBias: context.styleThreeBias ?? 0,
      stylePace: context.stylePace ?? 1,
      styleMotion: context.styleMotion ?? 0.5,
    },
    rng,
  })

  const setId = set?.id ?? 'isolation'
  let shooter = ballHandler
  let assister = null
  let openLook = pressure.winner === 'offense' && !pressure.helpCommitted
  let shotType = 'two'
  let screener = null
  let activeHelp = pressure.helpCommitted ? help : null

  if (setId === 'fast_break') {
    push({
      action: PLAY_ACTIONS.fast_break,
      text: `Contra-ataque! ${ballHandler.nome} em transição.`,
      actors: { ballHandler: ballHandler.nome },
    })
    shooter = ballHandler
    shotType = 'layup'
    openLook = true
  } else if (setId === 'pick_and_roll') {
    screener = pickScreener(offensePlayers, ballHandler, rng)
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

    const rollScore = combineScore([
      { value: attr(screener, 'arremesso.bandeja'), weight: 1.0 },
      { value: attr(screener, 'fisico.impulsao'), weight: 0.9 },
      { value: attr(ballHandler, 'qi.passe'), weight: 1.1 },
    ])
    const pullScore = combineScore([
      { value: attr(ballHandler, 'arremesso.tresPontos'), weight: 1.0 },
      { value: attr(ballHandler, 'arremesso.midRange'), weight: 0.9 },
      { value: attr(ballHandler, 'qi.tomadaDecisao'), weight: 0.8 },
    ])
    const driveScore = combineScore([
      { value: attr(ballHandler, 'fisico.velocidade'), weight: 1.2 },
      { value: attr(ballHandler, 'arremesso.bandeja'), weight: 1.0 },
    ])
    const branch = weightedBranch(
      [
        { id: 'roll', score: rollScore },
        { id: 'pull', score: pullScore },
        { id: 'drive', score: driveScore },
        {
          id: 'kick',
          score: combineScore([
            { value: attr(ballHandler, 'qi.visao'), weight: 1.2 },
            { value: pressure.helpCommitted ? 80 : 45, weight: 0.9 },
          ]),
        },
      ],
      rng,
    )

    if (branch === 'roll') {
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
      const kickTo = pickKickTarget(offensePlayers, ballHandler, rng)
      push({
        action: PLAY_ACTIONS.kick_out,
        text: `Kick out de ${ballHandler.nome} para ${kickTo.nome}.`,
        actors: { ballHandler: ballHandler.nome, receiver: kickTo.nome },
      })
      shooter = kickTo
      assister = ballHandler
      shotType = 'three'
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
      shooter = ballHandler
      shotType = pullScore > 0.55 ? 'three' : 'two'
    }
  } else if (setId === 'isolation') {
    push({
      action: PLAY_ACTIONS.isolation,
      text: `Isolation: ${ballHandler.nome} vs ${defender.nome}.`,
      actors: { ballHandler: ballHandler.nome, defender: defender.nome },
    })
    const isoBranch = weightedBranch(
      [
        {
          id: 'jumper',
          score: combineScore([
            { value: attr(ballHandler, 'arremesso.midRange'), weight: 1.2 },
            { value: attr(ballHandler, 'arremesso.tresPontos'), weight: 0.8 },
          ]),
        },
        {
          id: 'drive',
          score: combineScore([
            { value: attr(ballHandler, 'fisico.velocidade'), weight: 1.2 },
            { value: attr(ballHandler, 'arremesso.bandeja'), weight: 1.0 },
          ]),
        },
      ],
      rng,
    )
    if (isoBranch === 'drive') {
      push({
        action: PLAY_ACTIONS.drive,
        text: `${ballHandler.nome} acelera em drive.`,
        actors: { ballHandler: ballHandler.nome },
      })
      shotType = 'layup'
    } else {
      shotType =
        attr(ballHandler, 'arremesso.tresPontos') >=
        attr(ballHandler, 'arremesso.midRange')
          ? 'three'
          : 'two'
    }
    shooter = ballHandler
  } else if (setId === 'drive') {
    push({
      action: PLAY_ACTIONS.drive,
      text: `${ballHandler.nome} inicia o drive para a cesta.`,
      actors: { ballHandler: ballHandler.nome },
    })
    if (pressure.helpCommitted) {
      const kickTo = pickKickTarget(offensePlayers, ballHandler, rng)
      const kickDuel = contestedSelect(
        combineScore([
          { value: attr(ballHandler, 'qi.visao'), weight: 1.2 },
          { value: attr(ballHandler, 'qi.passe'), weight: 1.1 },
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
        shotType = 'three'
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
      text: `Post Up: ${post.nome} recebe no garrafão.`,
      actors: { post: post.nome },
    })
    shooter = post
    assister = post.id !== ballHandler.id ? ballHandler : null
    shotType = 'post'
    openLook = pressure.winner === 'offense'
  } else if (setId === 'cut') {
    screener = pickScreener(offensePlayers, ballHandler, rng)
    const cutter = pickCutter(offensePlayers, ballHandler, screener, rng)
    push({
      action: PLAY_ACTIONS.screen,
      text: `${screener.nome} bloqueia para liberar corte.`,
      actors: { screener: screener.nome },
    })
    push({
      action: PLAY_ACTIONS.cut,
      text: `${cutter.nome} corta à cesta; ${ballHandler.nome} procura o passe.`,
      actors: { cutter: cutter.nome, ballHandler: ballHandler.nome },
    })
    const cutDuel = contestedSelect(
      combineScore([
        { value: attr(ballHandler, 'qi.passe'), weight: 1.2 },
        { value: attr(cutter, 'fisico.velocidade'), weight: 1.1 },
        { value: attr(cutter, 'arremesso.bandeja'), weight: 0.8 },
      ]),
      combineScore([
        { value: attr(defender, 'defesa.garrafao'), weight: 1.0 },
        { value: attr(help, 'qi.tomadaDecisao'), weight: 0.9 },
      ]),
      rng,
    )
    if (cutDuel.winner === 'a') {
      shooter = cutter
      assister = ballHandler
      shotType = 'layup'
      openLook = true
    } else {
      shooter = ballHandler
      shotType = 'two'
      openLook = false
    }
  }

  // —— Finalização ——
  const shot = resolveShot({
    shooter,
    defender,
    helpDefender: activeHelp,
    shotType,
    isHome: offenseIsHome,
    openLook,
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
      rng,
    })
    return finishWithRebound({
      shot,
      reb,
      shooter,
      assister: null,
      blocker,
      events,
      push,
      packResult,
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
    return packResult({
      outcome: 'shooting_foul',
      points: shot.points,
      scorerId: shot.points > 0 ? shooter.id : null,
      foulerId: defender.id,
      fouledId: shooter.id,
      isThree: shotType === 'three',
      events,
      keepsPossession: false,
      transitionNext: false,
    })
  }

  if (shot.outcome === 'make') {
    const pts = shot.points
    push({
      action: setId === 'fast_break' ? PLAY_ACTIONS.fast_break : PLAY_ACTIONS.drive,
      text: assister
        ? `Cesta de ${shooter.nome} (${pts}) — assistência de ${assister.nome}.`
        : `Cesta de ${shooter.nome} (${pts}).`,
      actors: {
        shooter: shooter.nome,
        assister: assister?.nome,
      },
      points: pts,
    })
    return packResult({
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

  // Miss → rebound
  push({
    action: PLAY_ACTIONS.individual_defense,
    text: `${shooter.nome} erra o arremesso; disputa de rebote.`,
    actors: { shooter: shooter.nome },
  })

  const reb = resolveRebound({
    offensePlayers,
    defensePlayers,
    isHome: offenseIsHome,
    rng,
  })

  return finishWithRebound({
    shot: { ...shot, outcome: 'miss' },
    reb,
    shooter,
    assister: null,
    blocker: null,
    events,
    push,
    packResult,
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
    events: payload.events ?? [],
  }
}

function weightedBranch(entries, rng) {
  return weightedSelect(entries, rng)?.id
}
