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
    // Unwrap Spring Boot ApiResponse wrapper: return .data field when present
    const body = response.data
    if (body && typeof body === 'object' && 'data' in body) {
      return body.data
    }
    return body
  },
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Avoid redirect loops on the login page itself
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
