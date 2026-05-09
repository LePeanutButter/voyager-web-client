/** @type {number} */
let opaqueFallbackSeq = 0

/**
 * Sufijo no adivinable vía Math.random() (usa Web Crypto cuando existe).
 * @returns {string}
 */
export function randomOpaqueId() {
  const c = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID()
  if (c?.getRandomValues) {
    const buf = new Uint8Array(16)
    c.getRandomValues(buf)
    return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  opaqueFallbackSeq += 1
  return `opaque-${Date.now()}-${opaqueFallbackSeq}`
}

/** @type {number} */
let sessionFallbackSeq = 0

/**
 * Id de sesión de chat local; siempre prefijo `sess-` para compatibilidad con tests y UI.
 * @returns {string}
 */
export function newLocalChatSessionId() {
  const c = globalThis.crypto
  if (c?.randomUUID) return `sess-${c.randomUUID()}`
  if (c?.getRandomValues) {
    const buf = new Uint8Array(16)
    c.getRandomValues(buf)
    const hex = [...buf].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `sess-${hex}`
  }
  sessionFallbackSeq += 1
  return `sess-fallback-${Date.now()}-${sessionFallbackSeq}`
}
