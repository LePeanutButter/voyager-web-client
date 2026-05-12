import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import { socialCollaborationService } from './socialCollaborationService'

beforeEach(() => vi.clearAllMocks())

describe('socialCollaborationService', () => {
  it('getConnections normalizes', async () => {
    apiMock.get.mockResolvedValue({ data: [{ id: '1', username: 'u', status: 'ACTIVE' }] })
    const rows = await socialCollaborationService.getConnections(9)
    expect(rows[0]).toEqual({ id: 1, username: 'u', status: 'ACTIVE' })
  })

  it('getTripActivities', async () => {
    apiMock.get.mockResolvedValue([{ id: 1, name: 'a' }])
    const acts = await socialCollaborationService.getTripActivities(5)
    expect(acts[0].name).toBe('a')
  })

  it('shareActivity and updateSharedActivity', async () => {
    apiMock.post.mockResolvedValue({
      data: { id: 1, activityId: 2, senderId: 3, receiverId: 4, status: 'PENDING', sharedPlan: false },
    })
    const s = await socialCollaborationService.shareActivity(10, 20)
    expect(s.id).toBe(1)
    apiMock.patch.mockResolvedValue({
      data: { id: 1, activityId: 2, senderId: 3, receiverId: 4, status: 'ACCEPTED', sharedPlan: true },
    })
    await socialCollaborationService.updateSharedActivity(1, 'ACCEPT')
  })

  it('getCompatibilityMatches', async () => {
    apiMock.post.mockResolvedValue({
      data: [
        {
          userId: 1,
          totalScore: 1,
          destinationScore: 0,
          dateProximityScore: 0,
          interestScore: 0,
          matchedInterests: ['x'],
        },
      ],
    })
    const m = await socialCollaborationService.getCompatibilityMatches({ destination: 'd' })
    expect(m[0].userId).toBe(1)
  })

  it('unwrapApiResponse without data key', async () => {
    apiMock.get.mockResolvedValue([{ id: '1', username: 'a', status: '' }])
    const r = await socialCollaborationService.getConnections(1)
    expect(r[0].username).toBe('a')
  })

  it('unwrapApiResponse null o no objeto devuelve null tras normalizar', async () => {
    apiMock.get.mockResolvedValue(null)
    const r = await socialCollaborationService.getConnections(1)
    expect(r).toEqual([])
    apiMock.get.mockResolvedValue('x')
    const r2 = await socialCollaborationService.getTripActivities(1)
    expect(r2).toEqual([])
  })

  it('shareActivityLegacy y updateSharedActivityLegacy', async () => {
    apiMock.post.mockResolvedValue({
      data: { id: 9, activityId: 1, senderId: 2, receiverId: 3, status: 'PENDING', sharedPlan: false },
    })
    const s = await socialCollaborationService.shareActivityLegacy(7, 8)
    expect(s.id).toBe(9)
    apiMock.patch.mockResolvedValue({
      data: { id: 9, activityId: 1, senderId: 2, receiverId: 3, status: 'REJECTED', sharedPlan: false },
    })
    const u = await socialCollaborationService.updateSharedActivityLegacy(9, 'REJECT')
    expect(u.status).toBe('REJECTED')
    expect(apiMock.post).toHaveBeenCalledWith('/legacy/activities/7/share', { receiverId: 8 })
    expect(apiMock.patch).toHaveBeenCalledWith('/legacy/shared-activities/9', { action: 'REJECT' })
  })
})
