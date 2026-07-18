/**
 * Reação da torcida / mesa — baseada em mock rank vs pick real.
 */

export function buildCrowdReaction(pick, opts = {}) {
  if (!pick) {
    return {
      tone: 'neutral',
      label: 'Arena em expectativa',
      chant: 'Aguardando o comissário…',
      heat: 35,
    }
  }

  const mock = pick.mockRank ?? 99
  const number = pick.pickNumber ?? 99
  const delta = mock - number
  const isPlayerTeam = Boolean(opts.isPlayerTeam)
  const teamShort = (opts.teamShort ?? pick.teamId ?? 'NBA').toUpperCase()

  if (delta >= 4) {
    return {
      tone: 'steal',
      label: 'ROUBO!',
      chant: `${teamShort} rouba ${pick.prospectName} (#${mock} no mock) na pick ${number}!`,
      heat: isPlayerTeam ? 96 : 88,
    }
  }
  if (delta <= -4) {
    return {
      tone: 'reach',
      label: 'REACH',
      chant: `Mesa divide — ${pick.prospectName} era projeto #${mock} e saiu em ${number}.`,
      heat: isPlayerTeam ? 55 : 42,
    }
  }
  if (number <= 3) {
    return {
      tone: 'electric',
      label: 'LOTTERY',
      chant: `Explosão na arena — ${pick.prospectName} é escolha de elite.`,
      heat: isPlayerTeam ? 94 : 86,
    }
  }
  if (isPlayerTeam) {
    return {
      tone: 'home',
      label: 'SUA FRANQUIA',
      chant: `Torcida de ${teamShort} vibra com ${pick.prospectName} (${pick.posicao}).`,
      heat: 90,
    }
  }
  return {
    tone: 'solid',
    label: 'SÓLIDO',
    chant: `${teamShort} segue o board — ${pick.prospectName} encaixa no plano.`,
    heat: 68,
  }
}
