import api from './api'

export const travelService = {
  // Trips
  getTrips: async (params = {}) => {
    const response = await api.get('/trips', { params })
    return response
  },

  getTrip: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`)
    return response
  },

  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData)
    return response
  },

  updateTrip: async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData)
    return response
  },

  deleteTrip: async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`)
    return response
  },

  // Destinations
  getDestinations: async (params = {}) => {
    const response = await api.get('/destinations', { params })
    return response
  },

  getDestination: async (destinationId) => {
    const response = await api.get(`/destinations/${destinationId}`)
    return response
  },

  searchDestinations: async (query) => {
    const response = await api.get('/destinations/search', { params: { q: query } })
    return response
  },

  // Favorites
  getFavorites: async () => {
    const response = await api.get('/favorites')
    return response
  },

  addFavorite: async (destinationId) => {
    const response = await api.post('/favorites', { destinationId })
    return response
  },

  removeFavorite: async (destinationId) => {
    const response = await api.delete(`/favorites/${destinationId}`)
    return response
  },

  // Recommendations
  getRecommendations: async (preferences) => {
    const response = await api.post('/recommendations', preferences)
    return response
  },

  // Itinerary
  getItinerary: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/itinerary`)
    return response
  },

  updateItinerary: async (tripId, itineraryData) => {
    const response = await api.put(`/trips/${tripId}/itinerary`, itineraryData)
    return response
  },

  // Activities
  getActivities: async (destinationId) => {
    const response = await api.get(`/destinations/${destinationId}/activities`)
    return response
  },

  bookActivity: async (activityId, bookingData) => {
    const response = await api.post(`/activities/${activityId}/book`, bookingData)
    return response
  }
}
