import { describe, it, expect } from 'vitest'
import {
  extractActivitiesPayload,
  extractHotelsPayload,
  normalizeCatalogActivity,
  normalizeHotelRef,
} from './amadeusCatalog'

describe('extractActivitiesPayload / extractHotelsPayload', () => {
  it('returns [] when root is invalid', () => {
    expect(extractActivitiesPayload(null)).toEqual([])
    expect(extractActivitiesPayload('string')).toEqual([])
    expect(extractHotelsPayload(undefined)).toEqual([])
  })

  it('returns the data array when present', () => {
    expect(extractActivitiesPayload({ data: [1, 2] })).toEqual([1, 2])
    expect(extractHotelsPayload({ data: [{ id: 1 }] })).toEqual([{ id: 1 }])
  })

  it('returns [] when data is not an array', () => {
    expect(extractActivitiesPayload({ data: 'no' })).toEqual([])
    expect(extractHotelsPayload({})).toEqual([])
  })
})

describe('normalizeCatalogActivity', () => {
  it('returns null for invalid input', () => {
    expect(normalizeCatalogActivity(null)).toBeNull()
    expect(normalizeCatalogActivity('foo')).toBeNull()
  })

  it('normalises full activity payload', () => {
    const result = normalizeCatalogActivity({
      id: 42,
      name: 'Tour',
      shortDescription: 'Short',
      price: { amount: 25, currencyCode: 'EUR' },
      bookingLink: 'https://buy.example',
      rating: 4.5,
    })
    expect(result).toEqual({
      id: '42',
      name: 'Tour',
      description: 'Short',
      priceLabel: '25 EUR',
      bookingLink: 'https://buy.example',
      rating: '4.5',
    })
  })

  it('handles fallback fields and missing currency', () => {
    const result = normalizeCatalogActivity({
      title: 'Adventure',
      description: 'desc',
      price: { total: 99 },
    })
    expect(result.id).toMatch(/^act-/)
    expect(result.name).toBe('Adventure')
    expect(result.description).toBe('desc')
    expect(result.priceLabel).toBe('99')
    expect(result.bookingLink).toBeNull()
    expect(result.rating).toBeNull()
  })
})

describe('normalizeHotelRef', () => {
  it('returns null for invalid input', () => {
    expect(normalizeHotelRef(null)).toBeNull()
  })

  it('returns null when hotelId is missing', () => {
    expect(normalizeHotelRef({ name: 'Sin id' })).toBeNull()
  })

  it('normalises hotel reference and city code fallback', () => {
    expect(normalizeHotelRef({ hotelId: 7, name: 'H', cityCode: 'PAR' })).toEqual({
      hotelId: '7',
      name: 'H',
      cityCode: 'PAR',
    })
    expect(normalizeHotelRef({ hotelId: 'H1', iataCode: 'BCN' })).toEqual({
      hotelId: 'H1',
      name: 'Hotel',
      cityCode: 'BCN',
    })
  })
})
