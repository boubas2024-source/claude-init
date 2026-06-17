'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible — notifier l'utilisateur si besoin
              }
            })
          })
        })
        .catch(() => {
          // Service workers non supportés ou bloqués — mode dégradé
        })
    }
  }, [])

  return null
}
