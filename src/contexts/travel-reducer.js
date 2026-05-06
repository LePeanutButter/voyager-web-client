export const TRAVEL_ACTIONS = {
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
  LOAD_RECOMMENDATIONS: 'LOAD_RECOMMENDATIONS',
}

const handleSetLoading = (state, action) => ({
  ...state,
  loading: action.payload,
})

const handleSetError = (state, action) => ({
  ...state,
  error: action.payload,
  loading: false,
})

const handleClearError = (state) => ({
  ...state,
  error: null,
})

const handleLoadTrips = (state, action) => ({
  ...state,
  trips: action.payload,
  loading: false,
})

const handleAddTrip = (state, action) => ({
  ...state,
  trips: [...state.trips, action.payload],
  loading: false,
})

const handleUpdateTrip = (state, action) => ({
  ...state,
  trips: state.trips.map((trip) =>
    trip.id === action.payload.id ? action.payload : trip,
  ),
  loading: false,
})

const handleDeleteTrip = (state, action) => ({
  ...state,
  trips: state.trips.filter((trip) => trip.id !== action.payload),
  loading: false,
})

const handleSetCurrentTrip = (state, action) => ({
  ...state,
  currentTrip: action.payload,
})

const handleLoadDestinations = (state, action) => ({
  ...state,
  destinations: action.payload,
  loading: false,
})

const handleAddFavorite = (state, action) => ({
  ...state,
  favorites: [...state.favorites, action.payload],
})

const handleRemoveFavorite = (state, action) => ({
  ...state,
  favorites: state.favorites.filter((fav) => fav.id !== action.payload),
})

const handleLoadRecommendations = (state, action) => ({
  ...state,
  recommendations: action.payload,
  loading: false,
})

const actionHandlers = {
  [TRAVEL_ACTIONS.SET_LOADING]: handleSetLoading,
  [TRAVEL_ACTIONS.SET_ERROR]: handleSetError,
  [TRAVEL_ACTIONS.CLEAR_ERROR]: handleClearError,
  [TRAVEL_ACTIONS.LOAD_TRIPS]: handleLoadTrips,
  [TRAVEL_ACTIONS.ADD_TRIP]: handleAddTrip,
  [TRAVEL_ACTIONS.UPDATE_TRIP]: handleUpdateTrip,
  [TRAVEL_ACTIONS.DELETE_TRIP]: handleDeleteTrip,
  [TRAVEL_ACTIONS.SET_CURRENT_TRIP]: handleSetCurrentTrip,
  [TRAVEL_ACTIONS.LOAD_DESTINATIONS]: handleLoadDestinations,
  [TRAVEL_ACTIONS.ADD_FAVORITE]: handleAddFavorite,
  [TRAVEL_ACTIONS.REMOVE_FAVORITE]: handleRemoveFavorite,
  [TRAVEL_ACTIONS.LOAD_RECOMMENDATIONS]: handleLoadRecommendations,
}

export const initialTravelState = {
  trips: [],
  currentTrip: null,
  destinations: [],
  favorites: [],
  recommendations: [],
  loading: false,
  error: null,
}

export function travelReducer(state, action) {
  const run = actionHandlers[action.type]
  return run ? run(state, action) : state
}
