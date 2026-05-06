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
})
