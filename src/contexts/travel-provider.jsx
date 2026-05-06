import { useReducer } from 'react'
import PropTypes from 'prop-types'
import { TravelContext } from './travel-context.js'
import {
  travelReducer,
  initialTravelState,
  TRAVEL_ACTIONS,
} from './travel-reducer.js'
import {
  mockLoadTrips,
  mockAddTrip,
  mockUpdateTrip,
  mockDeleteTrip,
  mockLoadDestinations,
  mockAddFavorite,
  mockRemoveFavorite,
  mockLoadRecommendations,
} from './travel-mocks.js'

export const TravelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(travelReducer, initialTravelState)

  const setLoading = (loading) => {
    dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error })
  }

  const clearError = () => {
    dispatch({ type: TRAVEL_ACTIONS.CLEAR_ERROR })
  }

  const loadTrips = async () => {
    setLoading(true)
    try {
      const trips = await mockLoadTrips()
      dispatch({ type: TRAVEL_ACTIONS.LOAD_TRIPS, payload: trips })
    } catch (error) {
      setError(error.message)
    }
  }

  const addTrip = async (tripData) => {
    setLoading(true)
    try {
      const newTrip = await mockAddTrip(tripData)
      dispatch({ type: TRAVEL_ACTIONS.ADD_TRIP, payload: newTrip })
      return newTrip
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const updateTrip = async (tripId, tripData) => {
    setLoading(true)
    try {
      const updatedTrip = await mockUpdateTrip(tripId, tripData)
      dispatch({ type: TRAVEL_ACTIONS.UPDATE_TRIP, payload: updatedTrip })
      return updatedTrip
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const deleteTrip = async (tripId) => {
    setLoading(true)
    try {
      await mockDeleteTrip(tripId)
      dispatch({ type: TRAVEL_ACTIONS.DELETE_TRIP, payload: tripId })
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const setCurrentTrip = (trip) => {
    dispatch({ type: TRAVEL_ACTIONS.SET_CURRENT_TRIP, payload: trip })
  }

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const destinations = await mockLoadDestinations()
      dispatch({ type: TRAVEL_ACTIONS.LOAD_DESTINATIONS, payload: destinations })
    } catch (error) {
      setError(error.message)
    }
  }

  const addFavorite = async (destination) => {
    try {
      await mockAddFavorite(destination)
      dispatch({ type: TRAVEL_ACTIONS.ADD_FAVORITE, payload: destination })
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const removeFavorite = async (destinationId) => {
    try {
      await mockRemoveFavorite(destinationId)
      dispatch({ type: TRAVEL_ACTIONS.REMOVE_FAVORITE, payload: destinationId })
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const loadRecommendations = async (preferences) => {
    setLoading(true)
    try {
      const recommendations = await mockLoadRecommendations(preferences)
      dispatch({ type: TRAVEL_ACTIONS.LOAD_RECOMMENDATIONS, payload: recommendations })
    } catch (error) {
      setError(error.message)
    }
  }

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    loadTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    setCurrentTrip,
    loadDestinations,
    addFavorite,
    removeFavorite,
    loadRecommendations,
  }

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  )
}

TravelProvider.propTypes = {
  children: PropTypes.node,
}
