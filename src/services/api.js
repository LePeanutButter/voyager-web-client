import axios from 'axios'
import { extractErrorMessage } from '../utils/errorUtils'

const TOKEN_KEY = 'voyager_token'

/**
 * Primary Axios instance for voyager-backend-core (Spring Boot).
 * Base URL: VITE_API_BASE_URL (default: http://localhost:8080/api/v1)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Safely unwrap Spring Boot ApiResponse wrapper
    if (response && response.data && typeof response.data === 'object') {
      // If it has a top-level 'data' field, return that
      if ('data' in response.data) {
        return response.data.data
      }
      return response.data
    }
    return response?.data
  },
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (!globalThis.location?.pathname?.includes('/login')) {
        globalThis.location.href = '/login'
      }
    }

    const message = extractErrorMessage(error)
    const enhanced = new Error(message)
    enhanced.response = error.response
    enhanced.status = status
    return Promise.reject(enhanced)
  }
)

export { TOKEN_KEY }
export default api
