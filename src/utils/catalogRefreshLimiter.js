/**
 * Límite de actualizaciones manuales del catálogo (cliente).
 * El backend puede aplicar rate limiting adicional; esto reduce abuso y pulsaciones repetidas.
 */

export const CATALOG_REFRESH_COOLDOWN_MS = 45_000
export const CATALOG_REFRESH_WINDOW_MS = 60_000
export const CATALOG_REFRESH_MAX_PER_WINDOW = 8

/**
 * @param {{ current: number[] }} attemptsRef timestamps de refrescos manuales exitosos (ms)
 * @param {number} [now]
 * @returns {{ ok: true } | { ok: false, code: 'rate' | 'cooldown', retryAfterMs: number }}
 */
export function checkCatalogRefreshAllowed(attemptsRef, now = Date.now()) {
  const windowStart = now - CATALOG_REFRESH_WINDOW_MS
  const trimmed = attemptsRef.current.filter((t) => t > windowStart)
  attemptsRef.current = trimmed

  if (trimmed.length >= CATALOG_REFRESH_MAX_PER_WINDOW) {
    const oldest = trimmed[0]
    return {
      ok: false,
      code: 'rate',
      retryAfterMs: Math.max(0, oldest + CATALOG_REFRESH_WINDOW_MS - now),
    }
  }

  const last = trimmed.at(-1)
  if (last != null && now - last < CATALOG_REFRESH_COOLDOWN_MS) {
    return {
      ok: false,
      code: 'cooldown',
      retryAfterMs: Math.max(0, CATALOG_REFRESH_COOLDOWN_MS - (now - last)),
    }
  }

  return { ok: true }
}

/**
 * @param {{ current: number[] }} attemptsRef
 * @param {number} [now]
 */
export function recordCatalogManualRefresh(attemptsRef, now = Date.now()) {
  attemptsRef.current.push(now)
}
