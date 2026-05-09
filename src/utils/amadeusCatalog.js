/**
 * Normaliza respuestas del catálogo Amadeus (mock o live) tras el unwrap de ApiResponse.
 */

export function extractActivitiesPayload(root) {
  if (!root || typeof root !== 'object') return []
  const data = root.data
  return Array.isArray(data) ? data : []
}

export function extractHotelsPayload(root) {
  if (!root || typeof root !== 'object') return []
  const data = root.data
  return Array.isArray(data) ? data : []
}

/**
 * @param {object} raw
 * @returns {{ id: string, name: string, description: string, priceLabel: string|null, bookingLink: string|null, rating: string|null }}
 */
export function normalizeCatalogActivity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id != null ? String(raw.id) : `act-${raw.name || Math.random()}`
  const name = raw.name || raw.title || 'Actividad'
  const description = raw.shortDescription || raw.description || ''
  let priceLabel = null
  const p = raw.price
  if (p && typeof p === 'object') {
    const amt = p.amount ?? p.total
    const cur = p.currencyCode || p.currency || ''
    if (amt != null && String(amt).length > 0) {
      priceLabel = cur ? `${amt} ${cur}` : String(amt)
    }
  }
  const bookingLink = typeof raw.bookingLink === 'string' ? raw.bookingLink : null
  const rating = raw.rating != null ? String(raw.rating) : null
  return { id, name, description, priceLabel, bookingLink, rating }
}

/**
 * @param {object} raw
 * @returns {{ hotelId: string, name: string, cityCode: string|null }}
 */
export function normalizeHotelRef(raw) {
  if (!raw || typeof raw !== 'object') return null
  const hotelId = raw.hotelId != null ? String(raw.hotelId) : ''
  const name = raw.name || 'Hotel'
  const cityCode = raw.cityCode || raw.iataCode || null
  if (!hotelId) return null
  return { hotelId, name, cityCode }
}
