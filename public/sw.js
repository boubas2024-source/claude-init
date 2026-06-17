// Service Worker IMAZ — Mode dégradé offline (CDC-IMAZ-PLAT-NUM-2026-V1.0)
const CACHE_NAME = 'imaz-v1'
const OFFLINE_PAGE = '/offline'

// Ressources à pré-cacher au premier chargement
const PRECACHE_URLS = [
  '/',
  '/programmes',
  '/auth/connexion',
  '/auth/inscription',
  '/offline',
]

// ─── Installation ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Certaines URLs peuvent échouer en dev — ne pas bloquer l'install
      })
    )
  )
  self.skipWaiting()
})

// ─── Activation (nettoyage ancien cache) ─────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── Fetch — stratégies par type de ressource ────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les appels API (données temps réel)
  if (url.pathname.startsWith('/api/')) return
  // Ne pas intercepter les routes back-office
  if (url.pathname.startsWith('/backoffice/')) return
  // Ne pas intercepter les assets Next.js internes
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Pages HTML — Network first, fallback cache puis page offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // Images et assets statiques — Cache first
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request))
    return
  }
})

// ─── Stratégie : Network first → Cache → Offline ─────────────────────────────
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    const offlinePage = await caches.match(OFFLINE_PAGE)
    return offlinePage || new Response('Hors ligne', { status: 503 })
  }
}

// ─── Stratégie : Cache first → Network ───────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Ressource indisponible', { status: 503 })
  }
}
