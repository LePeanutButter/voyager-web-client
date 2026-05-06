import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import { travelService } from './travelService'

beforeEach(() => vi.clearAllMocks())

describe('travelService', () => {
  it('list normalizes content', async () => {
    apiMock.get.mockResolvedValue({ content: [{ id: 1 }] })
    expect(await travelService.list()).toEqual([{ id: 1 }])
    apiMock.get.mockResolvedValue({ records: [2] })
    expect(await travelService.list()).toEqual([2])
    apiMock.get.mockResolvedValue([3])
    expect(await travelService.list()).toEqual([3])
    apiMock.get.mockResolvedValue({})
    expect(await travelService.list()).toEqual([])
  })

  it('crud and activities', async () => {
    apiMock.get.mockResolvedValue({ id: 1 })
    await travelService.getById(1)
    apiMock.post.mockResolvedValue({})
    await travelService.create({ title: 't' })
    apiMock.put.mockResolvedValue({})
    await travelService.update(1, {})
    apiMock.delete.mockResolvedValue(undefined)
    await travelService.remove(1)
    await travelService.updateStatus(1, 'ACTIVE')
    await travelService.addActivity(1, { name: 'a' })
    await travelService.updateActivity(1, 2, {})
    await travelService.deleteActivity(1, 2)
  })

  it('matching', async () => {
    apiMock.get.mockResolvedValue([])
    await travelService.getCompatibleTravelers(5)
    await travelService.findMatches({
      destination: 'd',
      startDate: 'a',
      endDate: 'b',
      interests: [],
      limit: 5,
    })
    apiMock.post.mockResolvedValue([])
    await travelService.getCompatibilityMatches({ destination: 'd' })
  })
})
