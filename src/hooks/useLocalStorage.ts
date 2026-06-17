import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          if (next === null || next === undefined) {
            window.localStorage.removeItem(key)
          } else {
            window.localStorage.setItem(key, JSON.stringify(next))
          }
        } catch {
          // quota exceeded or private browsing — degrade silently
        }
        return next
      })
    },
    [key]
  )

  const remove = useCallback(() => {
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, remove] as const
}
