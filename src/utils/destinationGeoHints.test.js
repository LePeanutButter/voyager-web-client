import { describe, it, expect } from 'vitest'
import {
  normalizeDestinationSlugForSearch,
  resolveDestinationHint,
} from './destinationGeoHints'

describe('normalizeDestinationSlugForSearch', () => {
  it('returns "" for nullish input', () => {
    expect(normalizeDestinationSlugForSearch(null)).toBe('')
    expect(normalizeDestinationSlugForSearch(undefined)).toBe('')
    expect(normalizeDestinationSlugForSearch('   ')).toBe('')
  })

  it('strips backend dst_ prefix and underscores', () => {
    expect(normalizeDestinationSlugForSearch('dst_buenos_aires')).toBe('buenos aires')
    expect(normalizeDestinationSlugForSearch('Paris')).toBe('Paris')
  })
})

describe('resolveDestinationHint', () => {
  it('returns the default hint for empty input', () => {
    const hint = resolveDestinationHint('')
    expect(hint.matched).toBe(false)
    expect(hint.cityCode).toBe('MAD')
  })

  it('matches known cities case-insensitively with accents', () => {
    expect(resolveDestinationHint('París, Francia').cityCode).toBe('PAR')
    expect(resolveDestinationHint('Berlin').cityCode).toBe('BER')
    expect(resolveDestinationHint('Ciudad de Mexico').cityCode).toBe('MEX')
  })

  it('returns the default hint when no match', () => {
    const hint = resolveDestinationHint('Pueblo Inexistente')
    expect(hint.matched).toBe(false)
    expect(hint.cityCode).toBe('MAD')
  })
})
