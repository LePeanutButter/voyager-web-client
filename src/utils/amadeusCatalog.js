/**
 * Normaliza respuestas del catálogo Amadeus (mock o live) tras el unwrap de ApiResponse.
 */

import { randomOpaqueId } from './secureRandomId.js'

function extractCatalogDataArray(root) {
  if (root && typeof root === 'object') {
    const data = root.data
    return Array.isArray(data) ? data : []
  }
  return []
}

export const extractActivitiesPayload = extractCatalogDataArray
export const extractHotelsPayload = extractCatalogDataArray

function catalogActivityPriceLabel(rawPrice) {
  if (!rawPrice || typeof rawPrice !== 'object') return null
  const amt = rawPrice.amount ?? rawPrice.total
  const cur = rawPrice.currencyCode || rawPrice.currency || ''
  if (amt == null || String(amt).length === 0) return null
  return cur ? `${amt} ${cur}` : String(amt)
}

function catalogActivityId(raw) {
  return raw.id == null ? `act-${raw.name || randomOpaqueId()}` : String(raw.id)
}

/**
 * @param {object} raw
 * @returns {{ id: string, name: string, description: string, priceLabel: string|null, bookingLink: string|null, rating: string|null }}
 */
export function normalizeCatalogActivity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = catalogActivityId(raw)
  const name = raw.name || raw.title || 'Actividad'
  const description = raw.shortDescription || raw.description || ''
  const priceLabel = catalogActivityPriceLabel(raw.price)
  const bookingLink = typeof raw.bookingLink === 'string' ? raw.bookingLink : null
  const rating = raw.rating == null ? null : String(raw.rating)
  return { id, name, description, priceLabel, bookingLink, rating }
}

/**
 * @param {object} raw
 * @returns {{ hotelId: string, name: string, cityCode: string|null }}
 */
export function normalizeHotelRef(raw) {
  if (raw && typeof raw === 'object') {
    const hotelId = raw.hotelId == null ? '' : String(raw.hotelId)
    const name = raw.name || 'Hotel'
    const cityCode = raw.cityCode || raw.iataCode || null
    if (hotelId) {
      return { hotelId, name, cityCode }
    }
  }
  return null
}
