import { describe, it, expect } from 'vitest'
import { destinationExplorePath } from './destinationExploreNavigation'

describe('destinationExplorePath', () => {
  it('returns plain path when no params provided', () => {
    expect(destinationExplorePath()).toBe('/explore/destination')
  })

  it('encodes loc and country query params', () => {
    expect(destinationExplorePath({ loc: 'Paris', country: 'France' })).toBe(
      '/explore/destination?loc=Paris&country=France',
    )
  })

  it('appends destId when provided', () => {
    expect(destinationExplorePath({ destId: 42 })).toBe(
      '/explore/destination?destId=42',
    )
  })

  it('omits empty/whitespace fields', () => {
    expect(destinationExplorePath({ loc: '   ', country: '', destId: '' })).toBe(
      '/explore/destination',
    )
  })

  it('combines all fields when present', () => {
    const path = destinationExplorePath({
      loc: 'Roma',
      country: 'Italia',
      destId: 'd1',
    })
    expect(path).toBe('/explore/destination?loc=Roma&country=Italia&destId=d1')
  })
})
