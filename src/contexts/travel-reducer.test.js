import { describe, it, expect } from 'vitest'
import {
  travelReducer,
  initialTravelState,
  TRAVEL_ACTIONS,
} from './travel-reducer'

describe('travelReducer', () => {
  it('returns same state for unknown action', () => {
    expect(travelReducer(initialTravelState, { type: 'NOPE' })).toBe(initialTravelState)
  })

  it('SET_LOADING', () => {
    const s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.SET_LOADING,
      payload: true,
    })
    expect(s.loading).toBe(true)
  })

  it('SET_ERROR clears loading', () => {
    const s = travelReducer({ ...initialTravelState, loading: true }, {
      type: TRAVEL_ACTIONS.SET_ERROR,
      payload: 'e',
    })
    expect(s.error).toBe('e')
    expect(s.loading).toBe(false)
  })

  it('CLEAR_ERROR', () => {
    const s = travelReducer({ ...initialTravelState, error: 'x' }, {
      type: TRAVEL_ACTIONS.CLEAR_ERROR,
    })
    expect(s.error).toBeNull()
  })

  it('LOAD_TRIPS', () => {
    const trips = [{ id: 1 }]
    const s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.LOAD_TRIPS,
      payload: trips,
    })
    expect(s.trips).toEqual(trips)
    expect(s.loading).toBe(false)
  })

  it('ADD_TRIP', () => {
    const s = travelReducer(
      { ...initialTravelState, trips: [{ id: 1 }] },
      { type: TRAVEL_ACTIONS.ADD_TRIP, payload: { id: 2 } },
    )
    expect(s.trips).toHaveLength(2)
  })

  it('UPDATE_TRIP', () => {
    const s = travelReducer(
      { ...initialTravelState, trips: [{ id: 1, a: 1 }] },
      { type: TRAVEL_ACTIONS.UPDATE_TRIP, payload: { id: 1, a: 2 } },
    )
    expect(s.trips[0].a).toBe(2)
  })

  it('DELETE_TRIP', () => {
    const s = travelReducer(
      { ...initialTravelState, trips: [{ id: 1 }, { id: 2 }] },
      { type: TRAVEL_ACTIONS.DELETE_TRIP, payload: 1 },
    )
    expect(s.trips).toEqual([{ id: 2 }])
  })

  it('SET_CURRENT_TRIP', () => {
    const s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.SET_CURRENT_TRIP,
      payload: { id: 1 },
    })
    expect(s.currentTrip).toEqual({ id: 1 })
  })

  it('LOAD_DESTINATIONS', () => {
    const s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.LOAD_DESTINATIONS,
      payload: [1],
    })
    expect(s.destinations).toEqual([1])
  })

  it('ADD_FAVORITE / REMOVE_FAVORITE', () => {
    let s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.ADD_FAVORITE,
      payload: { id: 9 },
    })
    expect(s.favorites).toEqual([{ id: 9 }])
    s = travelReducer(s, {
      type: TRAVEL_ACTIONS.REMOVE_FAVORITE,
      payload: 9,
    })
    expect(s.favorites).toEqual([])
  })

  it('LOAD_RECOMMENDATIONS', () => {
    const s = travelReducer(initialTravelState, {
      type: TRAVEL_ACTIONS.LOAD_RECOMMENDATIONS,
      payload: [1],
    })
    expect(s.recommendations).toEqual([1])
  })
})
