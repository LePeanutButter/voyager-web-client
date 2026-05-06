import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import { businessService } from './businessService'

beforeEach(() => vi.clearAllMocks())

describe('businessService', () => {
  it('covers main endpoints', async () => {
    apiMock.get.mockResolvedValue({})
    await businessService.getDashboardStats()
    await businessService.getBookings({})
    await businessService.getBooking(1)
    apiMock.put.mockResolvedValue({})
    await businessService.updateBookingStatus(1, 'PAID')
    await businessService.getServices()
    apiMock.post.mockResolvedValue({})
    await businessService.createService({})
    await businessService.updateService(1, {})
    apiMock.delete.mockResolvedValue({})
    await businessService.deleteService(1)
    await businessService.getCustomers({})
    await businessService.getCustomer(1)
    await businessService.getAnalytics({})
    await businessService.getRevenueReport({})
    await businessService.getBookingReport({})
    await businessService.getReviews({})
    await businessService.respondToReview(1, 'thanks')
    await businessService.getPromotions()
    await businessService.createPromotion({})
    await businessService.updatePromotion(1, {})
    await businessService.deletePromotion(1)
    expect(apiMock.get.mock.calls.length).toBeGreaterThan(5)
  })
})
