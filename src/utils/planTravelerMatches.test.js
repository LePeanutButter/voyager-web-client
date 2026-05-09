import { describe, it, expect } from 'vitest'
import {
  normalizeTravelerListResponse,
  mergeDiscoveryMatches,
} from './planTravelerMatches'

describe('normalizeTravelerListResponse', () => {
  it('returns [] for falsy input', () => {
    expect(normalizeTravelerListResponse(null)).toEqual([])
    expect(normalizeTravelerListResponse(undefined)).toEqual([])
  })

  it('returns input arrays as-is', () => {
    expect(normalizeTravelerListResponse([1, 2])).toEqual([1, 2])
  })

  it('unwraps Spring page-style content', () => {
    expect(normalizeTravelerListResponse({ content: [1] })).toEqual([1])
  })

  it('unwraps records or data arrays', () => {
    expect(normalizeTravelerListResponse({ records: [2] })).toEqual([2])
    expect(normalizeTravelerListResponse({ data: [3] })).toEqual([3])
  })

  it('returns [] when no recognised shape is present', () => {
    expect(normalizeTravelerListResponse({ foo: 'bar' })).toEqual([])
  })
})

describe('mergeDiscoveryMatches', () => {
  it('normalizes backend list and excludes current user', () => {
    const compatList = [
      {
        userId: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        compatibilityScore: 0.5,
        sharedDestinations: ['Paris'],
      },
      {
        user_id: 2,
        first_name: 'Grace',
        last_name: 'Hopper',
        compatibility_score: 0.7,
      },
    ]
    const result = mergeDiscoveryMatches(compatList, null, 'Paris', 1)
    expect(result.map((m) => m.userId)).toEqual([2])
    expect(result[0].firstName).toBe('Grace')
    expect(result[0].source).toBe('backend')
  })

  it('merges AI buddy recommendations with backend matches', () => {
    const compatList = [
      { userId: 5, firstName: 'Linus', compatibilityScore: 0.4, sharedDestinations: ['Roma'] },
    ]
    const buddyPayload = {
      recommendations: [
        {
          userId: 5,
          name: 'Linus T',
          compatibilityScore: 0.9,
          sharedDestinations: ['Berlin'],
        },
        {
          userId: 9,
          name: 'New Buddy',
        },
      ],
    }
    const merged = mergeDiscoveryMatches(compatList, buddyPayload, 'Berlin', null)
    const linus = merged.find((m) => m.userId === 5)
    expect(linus.compatibilityScore).toBeCloseTo(0.9)
    expect(linus.source).toBe('both')
    expect(linus.sharedDestinations.sort()).toEqual(['Berlin', 'Roma'])
    const newBuddy = merged.find((m) => m.userId === 9)
    expect(newBuddy.firstName).toBe('New')
    expect(newBuddy.source).toBe('ai')
    expect(newBuddy.destinationLocation).toBe('Berlin')
  })

  it('parses JSON-encoded buddy payload', () => {
    const json = JSON.stringify({
      data: JSON.stringify({
        recommendations: [{ userId: 7, name: 'JSON Buddy' }],
      }),
    })
    const merged = mergeDiscoveryMatches([], json, null, null)
    expect(merged[0].userId).toBe(7)
  })

  it('handles missing userIds gracefully', () => {
    const merged = mergeDiscoveryMatches(
      [{ firstName: 'NoId' }],
      { recommendations: [{ name: 'Skip' }] },
      null,
      null,
    )
    expect(merged).toEqual([])
  })
})
