import api from './api'

export const aiService = {
  // Chat with AI assistant
  sendMessage: async (message, conversationHistory = []) => {
    const response = await api.post('/ai/chat', {
      message,
      conversationHistory
    })
    return response
  },

  // Get travel recommendations
  getRecommendations: async (preferences, tripType = 'general') => {
    const response = await api.post('/ai/recommendations', {
      preferences,
      tripType
    })
    return response
  },

  // Generate itinerary
  generateItinerary: async (tripData) => {
    const response = await api.post('/ai/itinerary/generate', tripData)
    return response
  },

  // Optimize existing itinerary
  optimizeItinerary: async (itineraryData, constraints = {}) => {
    const response = await api.post('/ai/itinerary/optimize', {
      itinerary: itineraryData,
      constraints
    })
    return response
  },

  // Get destination insights
  getDestinationInsights: async (destinationId) => {
    const response = await api.get(`/ai/destinations/${destinationId}/insights`)
    return response
  },

  // Get travel tips
  getTravelTips: async (destination, travelStyle = 'general') => {
    const response = await api.post('/ai/tips', {
      destination,
      travelStyle
    })
    return response
  },

  // Budget estimation
  estimateBudget: async (tripData) => {
    const response = await api.post('/ai/budget/estimate', tripData)
    return response
  },

  // Best time to visit
  getBestTimeToVisit: async (destinationId, preferences = {}) => {
    const response = await api.post(`/ai/destinations/${destinationId}/best-time`, preferences)
    return response
  },

  // Weather forecast
  getWeatherForecast: async (destinationId, dates) => {
    const response = await api.post(`/ai/destinations/${destinationId}/weather`, { dates })
    return response
  },

  // Local events and festivals
  getLocalEvents: async (destinationId, dateRange) => {
    const response = await api.post(`/ai/destinations/${destinationId}/events`, { dateRange })
    return response
  },

  // Language and culture tips
  getCulturalTips: async (destinationId) => {
    const response = await api.get(`/ai/destinations/${destinationId}/culture`)
    return response
  },

  // Safety information
  getSafetyInfo: async (destinationId) => {
    const response = await api.get(`/ai/destinations/${destinationId}/safety`)
    return response
  },

  // Transportation recommendations
  getTransportationOptions: async (origin, destination, preferences = {}) => {
    const response = await api.post('/ai/transportation', {
      origin,
      destination,
      preferences
    })
    return response
  },

  // Accommodation recommendations
  getAccommodationRecommendations: async (destinationId, preferences = {}) => {
    const response = await api.post(`/ai/destinations/${destinationId}/accommodations`, preferences)
    return response
  }
}
