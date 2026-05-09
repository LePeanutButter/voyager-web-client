/**
 * Ruta de exploración de destino (catálogo backend + planes del usuario).
 * @param {{ loc?: string, country?: string, destId?: string|number }} p
 * @returns {string}
 */
export function destinationExplorePath({ loc = '', country = '', destId = '' } = {}) {
  const params = new URLSearchParams()
  const a = String(loc || '').trim()
  const b = String(country || '').trim()
  const id = destId != null && destId !== '' ? String(destId).trim() : ''
  if (a) params.set('loc', a)
  if (b) params.set('country', b)
  if (id) params.set('destId', id)
  const q = params.toString()
  return q ? `/explore/destination?${q}` : '/explore/destination'
}
