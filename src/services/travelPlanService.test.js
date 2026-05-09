import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import { travelPlanService } from './travelPlanService'

beforeEach(() => vi.clearAllMocks())

describe('travelPlanService', () => {
  it('delegates to api', async () => {
    apiMock.post.mockResolvedValue({})
    await travelPlanService.create({})
    apiMock.get.mockResolvedValue([])
    await travelPlanService.list()
    apiMock.put.mockResolvedValue({})
    await travelPlanService.update(1, {})
    apiMock.delete.mockResolvedValue(undefined)
    await travelPlanService.remove(1)
    expect(apiMock.post).toHaveBeenCalled()
    expect(apiMock.get).toHaveBeenCalled()
    expect(apiMock.put).toHaveBeenCalled()
    expect(apiMock.delete).toHaveBeenCalled()
  })

  it('exercises remaining endpoints', async () => {
    apiMock.get.mockResolvedValue({})
    apiMock.post.mockResolvedValue({})
    apiMock.put.mockResolvedValue({})
    apiMock.delete.mockResolvedValue(undefined)

    await travelPlanService.getById(7)
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/7')
    await travelPlanService.getByUser(2, { page: 0 })
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/user/2', { params: { page: 0 } })
    await travelPlanService.updateStatus(7, 'ACTIVE')
    expect(apiMock.put).toHaveBeenCalledWith('/travel-plans/7/status', null, {
      params: { status: 'ACTIVE' },
    })

    await travelPlanService.addActivity(7, { name: 'a' })
    expect(apiMock.post).toHaveBeenCalledWith('/travel-plans/7/activities', { name: 'a' })
    await travelPlanService.getActivities(7)
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/7/activities')
    await travelPlanService.updateActivity(7, 9, { name: 'b' })
    expect(apiMock.put).toHaveBeenCalledWith('/travel-plans/7/activities/9', { name: 'b' })
    await travelPlanService.removeActivity(7, 9)
    expect(apiMock.delete).toHaveBeenCalledWith('/travel-plans/7/activities/9')

    await travelPlanService.getConnections(7)
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/7/connections', {
      params: { status: 'ACCEPTED' },
    })

    await travelPlanService.addReservation(7, { id: 1 })
    expect(apiMock.post).toHaveBeenCalledWith('/travel-plans/7/reservations', { id: 1 })
    await travelPlanService.getReservations(7)
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/7/reservations')

    await travelPlanService.sharePlan(7)
    expect(apiMock.post).toHaveBeenCalledWith('/travel-plans/7/share')
    await travelPlanService.getSharedPlan('tok')
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/shared/tok')

    await travelPlanService.getByStatus('ACTIVE')
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/status/ACTIVE', { params: {} })
    await travelPlanService.getByType('SOLO', { page: 1 })
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/type/SOLO', { params: { page: 1 } })

    await travelPlanService.getCompatibleTravelers(7)
    expect(apiMock.get).toHaveBeenCalledWith('/travel-plans/7/compatible-travelers')
  })
})
