import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'imaz-catalogue'
const DB_VERSION = 1
const STORE_PRODUITS = 'produits'
const STORE_PROGRAMMES = 'programmes'
const TTL_MS = 30 * 60 * 1000 // 30 min

interface CacheEntry<T> {
  data: T
  cachedAt: number
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PRODUITS))
          db.createObjectStore(STORE_PRODUITS, { keyPath: 'id' })
        if (!db.objectStoreNames.contains(STORE_PROGRAMMES))
          db.createObjectStore(STORE_PROGRAMMES, { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

async function putAll<T extends { id: string }>(storeName: string, items: T[]) {
  const db = await getDB()
  const tx = db.transaction(storeName, 'readwrite')
  const entry: CacheEntry<T[]> = { data: items, cachedAt: Date.now() }
  await tx.store.put({ id: '__all__', ...entry })
  await Promise.all(items.map((item) => tx.store.put(item)))
  await tx.done
}

async function getAll<T>(storeName: string): Promise<T[] | null> {
  try {
    const db = await getDB()
    const entry = await db.get(storeName, '__all__') as (CacheEntry<T[]> & { id: string }) | undefined
    if (!entry) return null
    if (Date.now() - entry.cachedAt > TTL_MS) return null
    return entry.data
  } catch {
    return null
  }
}

async function getOne<T>(storeName: string, id: string): Promise<T | null> {
  try {
    const db = await getDB()
    const item = await db.get(storeName, id) as T | undefined
    return item ?? null
  } catch {
    return null
  }
}

export const catalogueCache = {
  async cacheProduits<T extends { id: string }>(produits: T[]) {
    try { await putAll(STORE_PRODUITS, produits) } catch { /* ignore */ }
  },
  async cacheProgrammes<T extends { id: string }>(programmes: T[]) {
    try { await putAll(STORE_PROGRAMMES, programmes) } catch { /* ignore */ }
  },
  getProduits: <T>() => getAll<T>(STORE_PRODUITS),
  getProgrammes: <T>() => getAll<T>(STORE_PROGRAMMES),
  getProduit: <T>(id: string) => getOne<T>(STORE_PRODUITS, id),
  async clear() {
    try {
      const db = await getDB()
      await db.clear(STORE_PRODUITS)
      await db.clear(STORE_PROGRAMMES)
    } catch { /* ignore */ }
  },
}
