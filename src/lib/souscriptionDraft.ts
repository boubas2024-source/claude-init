const PREFIX = 'imaz_draft_'
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

export interface SouscriptionDraft {
  produitId: string
  step: number
  acceptsCGV: boolean
  savedAt: number
}

function key(produitId: string) {
  return `${PREFIX}${produitId}`
}

export const souscriptionDraft = {
  save(produitId: string, data: Omit<SouscriptionDraft, 'savedAt' | 'produitId'>) {
    try {
      const draft: SouscriptionDraft = { produitId, ...data, savedAt: Date.now() }
      localStorage.setItem(key(produitId), JSON.stringify(draft))
    } catch { /* quota exceeded */ }
  },

  load(produitId: string): SouscriptionDraft | null {
    try {
      const raw = localStorage.getItem(key(produitId))
      if (!raw) return null
      const draft: SouscriptionDraft = JSON.parse(raw)
      if (Date.now() - draft.savedAt > TTL_MS) {
        localStorage.removeItem(key(produitId))
        return null
      }
      return draft
    } catch {
      return null
    }
  },

  clear(produitId: string) {
    try { localStorage.removeItem(key(produitId)) } catch { /* ignore */ }
  },

  clearAll() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k))
    } catch { /* ignore */ }
  },
}
