import React, { createContext, useContext, useReducer } from 'react'

// Initial state
const initialState = {
  trips: [],
  currentTrip: null,
  destinations: [],
  favorites: [],
  recommendations: [],
  loading: false,
  error: null
}

// Action types
const TRAVEL_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_TRIPS: 'LOAD_TRIPS',
  ADD_TRIP: 'ADD_TRIP',
  UPDATE_TRIP: 'UPDATE_TRIP',
  DELETE_TRIP: 'DELETE_TRIP',
  SET_CURRENT_TRIP: 'SET_CURRENT_TRIP',
  LOAD_DESTINATIONS: 'LOAD_DESTINATIONS',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  LOAD_RECOMMENDATIONS: 'LOAD_RECOMMENDATIONS'
}

// Reducer
const travelReducer = (state, action) => {
  switch (action.type) {
    case TRAVEL_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    
    case TRAVEL_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    case TRAVEL_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    case TRAVEL_ACTIONS.LOAD_TRIPS:
      return {
        ...state,
        trips: action.payload,
        loading: false
      }
    
    case TRAVEL_ACTIONS.ADD_TRIP:
      return {
        ...state,
        trips: [...state.trips, action.payload],
        loading: false
      }
    
    case TRAVEL_ACTIONS.UPDATE_TRIP:
      return {
        ...state,
        trips: state.trips.map(trip => 
          trip.id === action.payload.id ? action.payload : trip
        ),
        loading: false
      }
    
    case TRAVEL_ACTIONS.DELETE_TRIP:
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        loading: false
      }
    
    case TRAVEL_ACTIONS.SET_CURRENT_TRIP:
      return {
        ...state,
        currentTrip: action.payload
      }
    
    case TRAVEL_ACTIONS.LOAD_DESTINATIONS:
      return {
        ...state,
        destinations: action.payload,
        loading: false
      }
    
    case TRAVEL_ACTIONS.ADD_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      }
    
    case TRAVEL_ACTIONS.REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.id !== action.payload)
      }
    
    case TRAVEL_ACTIONS.LOAD_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: action.payload,
        loading: false
      }
    
    default:
      return state
  }
}

// Create context
const TravelContext = createContext()

// Provider component
export const TravelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(travelReducer, initialState)

  // Actions
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
      // Simulate API call
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
    loadRecommendations
  }

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  )
}

// Custom hook
export const useTravel = () => {
  const context = useContext(TravelContext)
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider')
  }
  return context
}

// Mock API functions (replace with real API calls)
const mockLoadTrips = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          destination: 'Paris, France',
          startDate: '2024-06-15',
          endDate: '2024-06-22',
          status: 'planning',
          budget: 2000,
          travelers: 2
        },
        {
          id: 2,
          destination: 'Tokyo, Japan',
          startDate: '2024-08-10',
          endDate: '2024-08-20',
          status: 'confirmed',
          budget: 3500,
          travelers: 2
        }
      ])
    }, 500)
  })
}

const mockAddTrip = async (tripData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...tripData,
        status: 'planning'
      })
    }, 500)
  })
}

const mockUpdateTrip = async (tripId, tripData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: tripId,
        ...tripData
      })
    }, 500)
  })
}

const mockDeleteTrip = async (tripId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

const mockLoadDestinations = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Paris, France', country: 'France', type: 'city', rating: 4.8 },
        { id: 2, name: 'Bali, Indonesia', country: 'Indonesia', type: 'island', rating: 4.9 },
        { id: 3, name: 'Tokyo, Japan', country: 'Japan', type: 'city', rating: 4.7 }
      ])
    }, 500)
  })
}

const mockAddFavorite = async (destination) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}

const mockRemoveFavorite = async (destinationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}

const mockLoadRecommendations = async (preferences) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Santorini, Greece', reason: 'Perfect for romantic getaways', score: 0.95 },
        { id: 2, name: 'Swiss Alps, Switzerland', reason: 'Great for adventure activities', score: 0.88 }
      ])
    }, 800)
  })
}
