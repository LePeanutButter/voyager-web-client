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

function maybeRetryRequest(config, error, client) {
  if (config && config._retryCount === undefined) {
    config._retryCount = 0
  }
  const isTransient =
    error.code === 'ECONNABORTED' ||
    (error.response && error.response.status >= 500)
  if (config && config._retryCount < 2 && isTransient) {
    config._retryCount += 1
    return client(config)
  }
  return null
}

function clearSessionIfUnauthorized(status) {
  if (status !== 401) return
  localStorage.removeItem(TOKEN_KEY)
  if (globalThis.location?.pathname?.includes('/login')) return
  globalThis.location.href = '/login'
}

async function handleApiFailure(error, client) {
  const retry = maybeRetryRequest(error.config, error, client)
  if (retry) return retry

  const config = error.config
  const status = error.response?.status
  const message = extractErrorMessage(error) || 'An unexpected error occurred'

  console.error('[API SERVICE ERROR]', {
    url: config?.url,
    method: config?.method,
    status,
    message,
    retryCount: config?._retryCount || 0,
  })

  clearSessionIfUnauthorized(status)

  const enhanced = new Error(message)
  enhanced.response = error.response
  enhanced.status = status
  throw enhanced
}

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
  async (error) => handleApiFailure(error, api)
)

export default api
