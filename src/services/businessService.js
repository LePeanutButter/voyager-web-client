import api from './api'

export const businessService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/business/dashboard')
    return response
  },

  // Bookings
  getBookings: async (params = {}) => {
    const response = await api.get('/business/bookings', { params })
    return response
  },

  getBooking: async (bookingId) => {
    const response = await api.get(`/business/bookings/${bookingId}`)
    return response
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await api.put(`/business/bookings/${bookingId}/status`, { status })
    return response
  },

  // Services
  getServices: async () => {
    const response = await api.get('/business/services')
    return response
  },

  createService: async (serviceData) => {
    const response = await api.post('/business/services', serviceData)
    return response
  },

  updateService: async (serviceId, serviceData) => {
    const response = await api.put(`/business/services/${serviceId}`, serviceData)
    return response
  },

  deleteService: async (serviceId) => {
    const response = await api.delete(`/business/services/${serviceId}`)
    return response
  },

  // Customers
  getCustomers: async (params = {}) => {
    const response = await api.get('/business/customers', { params })
    return response
  },

  getCustomer: async (customerId) => {
    const response = await api.get(`/business/customers/${customerId}`)
    return response
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/business/analytics', { params })
    return response
  },

  getRevenueReport: async (params = {}) => {
    const response = await api.get('/business/reports/revenue', { params })
    return response
  },

  getBookingReport: async (params = {}) => {
    const response = await api.get('/business/reports/bookings', { params })
    return response
  },

  // Reviews
  getReviews: async (params = {}) => {
    const response = await api.get('/business/reviews', { params })
    return response
  },

  respondToReview: async (reviewId, responseText) => {
    const response = await api.post(`/business/reviews/${reviewId}/respond`, { response: responseText })
    return response
  },

  // Promotions
  getPromotions: async () => {
    const response = await api.get('/business/promotions')
    return response
  },

  createPromotion: async (promotionData) => {
    const response = await api.post('/business/promotions', promotionData)
    return response
  },

  updatePromotion: async (promotionId, promotionData) => {
    const response = await api.put(`/business/promotions/${promotionId}`, promotionData)
    return response
  },

  deletePromotion: async (promotionId) => {
    const response = await api.delete(`/business/promotions/${promotionId}`)
    return response
  }
}
