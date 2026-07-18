import { PLAYERS } from './database'
import { POSITIONS } from './schema'
import { calcGroupRating, formatMoney, listFlatAttributes } from './utils'

/**
 * Banco de dados local em memória.
 * API síncrona para consultas — sem side-effects de UI.
 */
export class PlayerDatabase {
  constructor(records = PLAYERS) {
    this._players = records.map((p) => Object.freeze({ ...p }))
    this._byId = new Map(this._players.map((p) => [p.id, p]))
  }

  getAll() {
    return [...this._players]
  }

  count() {
    return this._players.length
  }

  getById(id) {
    return this._byId.get(id) ?? null
  }

  getByIds(ids = []) {
    return ids.map((id) => this.getById(id)).filter(Boolean)
  }

  getByPosition(posicao) {
    return this._players.filter((p) => p.posicao === posicao)
  }

  getByArchetype(arquetipo) {
    return this._players.filter((p) => p.arquetipo === arquetipo)
  }

  /**
   * Filtros opcionais: posicao, arquetipo, minOverall, maxAge, minPotential.
   */
  query(filters = {}) {
    const {
      posicao,
      arquetipo,
      minOverall,
      maxOverall,
      minAge,
      maxAge,
      minPotential,
      search,
    } = filters

    return this._players.filter((p) => {
      if (posicao && p.posicao !== posicao) return false
      if (arquetipo && p.arquetipo !== arquetipo) return false
      if (minOverall != null && p.overall < minOverall) return false
      if (maxOverall != null && p.overall > maxOverall) return false
      if (minAge != null && p.idade < minAge) return false
      if (maxAge != null && p.idade > maxAge) return false
      if (minPotential != null && p.potencial < minPotential) return false
      if (search) {
        const q = String(search).toLowerCase()
        if (!p.nome.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }

  sortBy(field = 'overall', direction = 'desc') {
    const dir = direction === 'asc' ? 1 : -1
    return [...this._players].sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (typeof av === 'string') return av.localeCompare(bv) * dir
      return (av - bv) * dir
    })
  }

  getTop(n = 10, field = 'overall') {
    return this.sortBy(field, 'desc').slice(0, n)
  }

  getPositionsSummary() {
    return POSITIONS.reduce((acc, pos) => {
      acc[pos] = this.getByPosition(pos).length
      return acc
    }, {})
  }

  /** Snapshot legível para debug / UI futura */
  describe(id) {
    const player = this.getById(id)
    if (!player) return null

    return {
      ...player,
      groupRatings: {
        fisico: calcGroupRating(player.fisico),
        arremesso: calcGroupRating(player.arremesso),
        defesa: calcGroupRating(player.defesa),
        qi: calcGroupRating(player.qi),
      },
      valorMercadoLabel: formatMoney(player.valorMercado),
      salarioLabel: formatMoney(player.salario),
      atributosFlat: listFlatAttributes(player),
    }
  }
}

/** Instância singleton do banco local */
export const playerDb = new PlayerDatabase()
