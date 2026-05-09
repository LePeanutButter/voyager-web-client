/**
 * Límite de pulsaciones en «Actualizar sugerencias» (Descubrir).
 * Reduce abuso del endpoint de matching / IA desde el cliente.
 */

export const DISCOVER_REFRESH_COOLDOWN_MS = 60_000
export const DISCOVER_REFRESH_WINDOW_MS = 60_000
export const DISCOVER_REFRESH_MAX_PER_WINDOW = 6

/**
 * @param {{ current: number[] }} attemptsRef marcas de tiempo de refrescos manuales exitosos (ms)
 * @param {number} [now]
 * @returns {{ ok: true } | { ok: false, code: 'rate' | 'cooldown', retryAfterMs: number }}
 */
export function checkDiscoverRefreshAllowed(attemptsRef, now = Date.now()) {
  const windowStart = now - DISCOVER_REFRESH_WINDOW_MS
  const trimmed = attemptsRef.current.filter((t) => t > windowStart)
  attemptsRef.current = trimmed

  if (trimmed.length >= DISCOVER_REFRESH_MAX_PER_WINDOW) {
    const oldest = trimmed[0]
    return {
      ok: false,
      code: 'rate',
      retryAfterMs: Math.max(0, oldest + DISCOVER_REFRESH_WINDOW_MS - now),
    }
  }

  const last = trimmed.at(-1)
  if (last != null && now - last < DISCOVER_REFRESH_COOLDOWN_MS) {
    return {
      ok: false,
      code: 'cooldown',
      retryAfterMs: Math.max(0, DISCOVER_REFRESH_COOLDOWN_MS - (now - last)),
    }
  }

  return { ok: true }
}

/**
 * @param {{ current: number[] }} attemptsRef
 * @param {number} [now]
 */
export function recordDiscoverManualRefresh(attemptsRef, now = Date.now()) {
  attemptsRef.current.push(now)
}
