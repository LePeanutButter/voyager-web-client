import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import { TravelProvider } from './travel-provider.jsx'
import { useTravel } from './use-travel.js'

function Driver() {
  const v = useTravel()
  return (
    <button
      type="button"
      onClick={async () => {
        await v.loadTrips()
        await v.addTrip({ destination: 'Paris' })
        await v.updateTrip(1, { destination: 'Rome' })
        await v.deleteTrip(2)
        v.setCurrentTrip({ id: 9 })
        await v.loadDestinations()
        await v.addFavorite({ id: 3 })
        await v.removeFavorite(3)
        await v.loadRecommendations({ prefs: true })
        v.clearError()
        v.setLoading(false)
        v.setError('x')
      }}
    >
      run
    </button>
  )
}

describe('TravelProvider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('exposes travel actions', async () => {
    render(
      <TravelProvider>
        <Driver />
      </TravelProvider>,
    )
    await act(async () => {
      screen.getByRole('button', { name: 'run' }).click()
    })
    await act(async () => {
      await vi.runAllTimersAsync()
    })
  })
})
