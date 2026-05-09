import { describe, it, expect } from 'vitest'
import {
  normalizeConnections,
  normalizeActivities,
  normalizeSharedActivity,
  normalizeCompatibilityMatches,
} from './socialModels'

describe('socialModels', () => {
  it('normalizeConnections', () => {
    expect(normalizeConnections(null)).toEqual([])
    expect(normalizeConnections([{ id: '1', username: 'u', status: 'x' }])).toEqual([
      { id: 1, username: 'u', status: 'x' },
    ])
  })

  it('normalizeActivities', () => {
    expect(normalizeActivities([{ id: 2, name: '  n  ' }])).toEqual([
      { id: 2, name: 'n' },
    ])
  })

  it('normalizeSharedActivity', () => {
    expect(normalizeSharedActivity({ id: 1, activityId: 2, senderId: 3, receiverId: 4, status: 'PENDING', sharedPlan: 1 })).toEqual({
      id: 1,
      activityId: 2,
      senderId: 3,
      receiverId: 4,
      status: 'PENDING',
      sharedPlan: true,
    })
  })

  it('normalizeCompatibilityMatches', () => {
    expect(
      normalizeCompatibilityMatches([
        {
          userId: 1,
          totalScore: 0.5,
          destinationScore: 0.1,
          dateProximityScore: 0.2,
          interestScore: 0.2,
          matchedInterests: ['a'],
        },
      ]),
    ).toEqual([
      {
        userId: 1,
        totalScore: 0.5,
        destinationScore: 0.1,
        dateProximityScore: 0.2,
        interestScore: 0.2,
        matchedInterests: ['a'],
      },
    ])
  })

  it('applies safe defaults for missing fields and falsy inputs', () => {
    expect(normalizeConnections([{}])).toEqual([
      { id: 0, username: 'Unknown user', status: '' },
    ])
    expect(normalizeActivities([{ id: 4 }])).toEqual([{ id: 4, name: 'Activity 4' }])
    expect(normalizeActivities('not-array')).toEqual([])

    expect(normalizeSharedActivity(null)).toEqual({
      id: 0,
      activityId: 0,
      senderId: 0,
      receiverId: 0,
      status: 'PENDING',
      sharedPlan: false,
    })

    expect(normalizeCompatibilityMatches([{ matchedInterests: 'oops' }])).toEqual([
      {
        userId: 0,
        totalScore: 0,
        destinationScore: 0,
        dateProximityScore: 0,
        interestScore: 0,
        matchedInterests: [],
      },
    ])
  })
})
