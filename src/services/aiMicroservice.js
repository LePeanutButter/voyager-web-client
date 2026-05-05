import axios from 'axios'
import { extractErrorMessage } from '../utils/errorUtils'
import { TOKEN_KEY } from './api'

/**
 * Axios instance for voyager-ai-service (FastAPI).
 * Base URL: VITE_AI_SERVICE_BASE_URL (default: http://localhost:8000/api/v1)
 */
const aiMicroservice = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000, // AI responses can take longer
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
aiMicroservice.interceptors.request.use(
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
aiMicroservice.interceptors.response.use(
  (response) => {
    // Safely unwrap FastAPI response, aligning with api.js
    if (response && response.data && typeof response.data === 'object') {
      if ('data' in response.data) {
        return response.data.data
      }
      return response.data
    }
    return response?.data
  },
  (error) => {
    const status = error.response?.status
    const message = extractErrorMessage(error)
    
    console.error('[AI SERVICE ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message
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
    return Promise.reject(enhanced)
  }
)

export default aiMicroservice
