import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mockLoadTrips,
  mockAddTrip,
  mockUpdateTrip,
  mockDeleteTrip,
  mockLoadDestinations,
  mockAddFavorite,
  mockRemoveFavorite,
  mockLoadRecommendations,
} from './travel-mocks'

describe('travel-mocks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('mockLoadTrips resolves with trips', async () => {
    const p = mockLoadTrips()
    await vi.advanceTimersByTimeAsync(500)
    const trips = await p
    expect(Array.isArray(trips)).toBe(true)
    expect(trips[0]).toHaveProperty('destination')
  })

  it('mockAddTrip', async () => {
    const p = mockAddTrip({ destination: 'X' })
    await vi.advanceTimersByTimeAsync(500)
    const t = await p
    expect(t.destination).toBe('X')
    expect(t.status).toBe('planning')
  })

  it('mockUpdateTrip', async () => {
    const p = mockUpdateTrip(5, { destination: 'Y' })
    await vi.advanceTimersByTimeAsync(500)
    expect(await p).toMatchObject({ id: 5, destination: 'Y' })
  })

  it('mockDeleteTrip', async () => {
    const p = mockDeleteTrip(3)
    await vi.advanceTimersByTimeAsync(500)
    expect(await p).toEqual({ deletedId: 3 })
  })

  it('mockLoadDestinations', async () => {
    const p = mockLoadDestinations()
    await vi.advanceTimersByTimeAsync(500)
    expect((await p).length).toBeGreaterThan(0)
  })

  it('mockAddFavorite / mockRemoveFavorite', async () => {
    let p = mockAddFavorite({ id: 1 })
    await vi.advanceTimersByTimeAsync(300)
    expect(await p).toEqual({ added: 1 })
    p = mockAddFavorite({})
    await vi.advanceTimersByTimeAsync(300)
    expect(await p).toEqual({ added: true })
    p = mockRemoveFavorite(2)
    await vi.advanceTimersByTimeAsync(300)
    expect(await p).toEqual({ removedId: 2 })
  })

  it('mockLoadRecommendations', async () => {
    const p = mockLoadRecommendations({})
    await vi.advanceTimersByTimeAsync(800)
    const recs = await p
    expect(Array.isArray(recs)).toBe(true)
  })
})
