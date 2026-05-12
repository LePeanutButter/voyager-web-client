import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSocialCollaboration } from './useSocialCollaboration'
import { SHARED_ACTIVITY_ACTIONS } from '../api/socialContracts'

const svc = vi.hoisted(() => ({
  getConnections: vi.fn(),
  getTripActivities: vi.fn(),
  shareActivity: vi.fn(),
  updateSharedActivity: vi.fn(),
  getCompatibilityMatches: vi.fn(),
}))

vi.mock('../services/socialCollaborationService', () => ({
  socialCollaborationService: svc,
}))

beforeEach(() => {
  vi.clearAllMocks()
  svc.getConnections.mockResolvedValue([{ id: 1, username: 'a', status: '' }])
  svc.getTripActivities.mockResolvedValue([{ id: 1, name: 'x' }])
  svc.shareActivity.mockResolvedValue({ id: 10, activityId: 1, senderId: 1, receiverId: 2, status: 'PENDING', sharedPlan: false })
  svc.updateSharedActivity.mockResolvedValue({ id: 10, activityId: 1, senderId: 1, receiverId: 2, status: 'ACCEPTED', sharedPlan: true })
  svc.getCompatibilityMatches.mockResolvedValue([
    { userId: 1, totalScore: 1, destinationScore: 0, dateProximityScore: 0, interestScore: 0, matchedInterests: ['beach'] },
  ])
})

describe('useSocialCollaboration', () => {
  it('load share resolve matches toggle', async () => {
    const { result } = renderHook(() => useSocialCollaboration())
    await act(async () => {
      await result.current.loadConnections(1)
      await result.current.loadActivities(5)
      await result.current.shareActivity(1, 2)
      await result.current.resolveSharedActivity(10, SHARED_ACTIVITY_ACTIONS.ACCEPT)
      await result.current.loadCompatibilityMatches({
        destination: ' Lima ',
        startDate: 'a',
        endDate: 'b',
        interestsRaw: 'beach, sun ',
      })
    })
    act(() => {
      result.current.toggleInterest('beach')
      result.current.toggleInterest('beach')
    })
    expect(result.current.filteredMatches.length).toBeGreaterThan(0)
  })
})
