/**
 * Save Service — persistência LocalStorage + múltiplos slots.
 */

import {
  DEFAULT_SAVE_NAME,
  MAX_SAVE_SLOTS,
  SAVE_ACTIVE_KEY,
  SAVE_INDEX_KEY,
  SAVE_SLOT_KEY,
} from '../data/save/constants'
import {
  createSavePayload,
  generateSaveId,
  hydrateSaveToOverrides,
  validateSavePayload,
} from '../engine/save'

function storage() {
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

function readJson(key, fallback = null) {
  const ls = storage()
  if (!ls) return fallback
  try {
    const raw = ls.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  const ls = storage()
  if (!ls) return false
  try {
    ls.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function removeKey(key) {
  const ls = storage()
  if (!ls) return
  try {
    ls.removeItem(key)
  } catch {
    // ignore
  }
}

function readIndex() {
  const index = readJson(SAVE_INDEX_KEY, [])
  return Array.isArray(index) ? index : []
}

function writeIndex(index) {
  return writeJson(SAVE_INDEX_KEY, index)
}

function toIndexEntry(payload) {
  return {
    id: payload.id,
    name: payload.name,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    auto: Boolean(payload.auto),
    summary: payload.summary,
  }
}

export const saveService = {
  listSaves() {
    return readIndex().sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  },

  getActiveSaveId() {
    return readJson(SAVE_ACTIVE_KEY, null)
  },

  setActiveSaveId(id) {
    if (!id) {
      removeKey(SAVE_ACTIVE_KEY)
      return true
    }
    return writeJson(SAVE_ACTIVE_KEY, id)
  },

  getSave(id) {
    if (!id) return null
    const payload = readJson(SAVE_SLOT_KEY(id), null)
    const check = validateSavePayload(payload)
    if (!check.ok) return null
    return payload
  },

  /**
   * Cria um novo slot a partir do estado atual.
   */
  createSave(state, name = DEFAULT_SAVE_NAME, opts = {}) {
    const index = readIndex()
    if (index.length >= MAX_SAVE_SLOTS) {
      return {
        ok: false,
        error: `Limite de ${MAX_SAVE_SLOTS} saves atingido.`,
        payload: null,
      }
    }

    const id = opts.id ?? generateSaveId()
    const payload = createSavePayload(state, {
      id,
      name: name?.trim() || DEFAULT_SAVE_NAME,
      auto: Boolean(opts.auto),
      createdAt: Date.now(),
    })

    const written = writeJson(SAVE_SLOT_KEY(id), payload)
    if (!written) {
      return { ok: false, error: 'Falha ao gravar no LocalStorage.', payload: null }
    }

    writeIndex([toIndexEntry(payload), ...index.filter((s) => s.id !== id)])
    if (opts.setActive !== false) {
      this.setActiveSaveId(id)
    }

    return { ok: true, error: null, payload }
  },

  /**
   * Sobrescreve um slot existente (ou cria se não houver active).
   */
  saveToSlot(state, saveId, opts = {}) {
    const id = saveId ?? this.getActiveSaveId()
    if (!id) {
      return this.createSave(state, opts.name ?? DEFAULT_SAVE_NAME, {
        auto: opts.auto,
      })
    }

    const existing = this.getSave(id)
    const payload = createSavePayload(state, {
      id,
      name: opts.name ?? existing?.name ?? DEFAULT_SAVE_NAME,
      createdAt: existing?.createdAt ?? Date.now(),
      auto: opts.auto ?? existing?.auto ?? false,
    })

    const written = writeJson(SAVE_SLOT_KEY(id), payload)
    if (!written) {
      return { ok: false, error: 'Falha ao gravar no LocalStorage.', payload: null }
    }

    const index = readIndex().filter((s) => s.id !== id)
    writeIndex([toIndexEntry(payload), ...index])
    if (opts.setActive !== false) {
      this.setActiveSaveId(id)
    }

    return { ok: true, error: null, payload }
  },

  /**
   * Auto-save após a semana — usa o slot ativo ou cria um.
   */
  autoSave(state) {
    const activeId = this.getActiveSaveId()
    if (activeId && this.getSave(activeId)) {
      return this.saveToSlot(state, activeId, { auto: true })
    }
    return this.createSave(state, DEFAULT_SAVE_NAME, { auto: true })
  },

  loadSave(id) {
    const payload = this.getSave(id)
    if (!payload) {
      return { ok: false, error: 'Save não encontrado.', overrides: null, payload: null }
    }
    const overrides = hydrateSaveToOverrides(payload)
    this.setActiveSaveId(id)
    return { ok: true, error: null, overrides, payload }
  },

  loadActiveSave() {
    const id = this.getActiveSaveId()
    if (!id) {
      return { ok: false, error: 'Nenhum save ativo.', overrides: null, payload: null }
    }
    return this.loadSave(id)
  },

  deleteSave(id) {
    if (!id) return { ok: false, error: 'Id inválido.' }
    removeKey(SAVE_SLOT_KEY(id))
    const index = readIndex().filter((s) => s.id !== id)
    writeIndex(index)
    if (this.getActiveSaveId() === id) {
      const next = index[0]?.id ?? null
      this.setActiveSaveId(next)
    }
    return { ok: true, error: null }
  },

  renameSave(id, name) {
    const payload = this.getSave(id)
    if (!payload) return { ok: false, error: 'Save não encontrado.' }
    const nextName = name?.trim()
    if (!nextName) return { ok: false, error: 'Nome inválido.' }

    const updated = { ...payload, name: nextName, updatedAt: Date.now() }
    writeJson(SAVE_SLOT_KEY(id), updated)
    const index = readIndex().map((s) =>
      s.id === id ? toIndexEntry(updated) : s,
    )
    writeIndex(index)
    return { ok: true, error: null, payload: updated }
  },
}
