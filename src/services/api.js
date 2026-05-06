import axios from 'axios'
import { extractErrorMessage } from '../utils/errorUtils'

export const TOKEN_KEY = 'voyager_token'

/**
 * Primary Axios instance for voyager-backend-core (Spring Boot).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
  (error) => { throw error }
)

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (!response) return null

    // Safely unwrap Spring Boot ApiResponse wrapper
    let unwrappedData = response.data
    if (unwrappedData && typeof unwrappedData === 'object' && 'data' in unwrappedData) {
      unwrappedData = unwrappedData.data
    }
    
    return unwrappedData
  },
  async (error) => {
    const config = error.config
    
    // Lightweight retry logic (max 2 retries) for transient/timeout errors
    if (config && !config._retryCount) {
      config._retryCount = 0
    }
    
    if (
      config &&
      config._retryCount < 2 &&
      (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500))
    ) {
      config._retryCount += 1
      return api(config)
    }

    const status = error.response?.status
    const message = extractErrorMessage(error) || 'An unexpected error occurred'

    console.error('[API SERVICE ERROR]', {
      url: config?.url,
      method: config?.method,
      status,
      message,
      retryCount: config?._retryCount || 0
    })

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (!globalThis.location?.pathname?.includes('/login')) {
        globalThis.location.href = '/login'
      }
    }

    const enhanced = new Error(message)
    enhanced.response = error.response
    enhanced.status = status
    throw enhanced
  }
)

export default api
