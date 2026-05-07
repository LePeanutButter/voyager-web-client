import axios from 'axios'
import { extractErrorMessage } from '../utils/errorUtils'
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseMapper'
import { TOKEN_KEY } from './api'

/**
 * Axios instance for voyager-ai-service (FastAPI).
 */
const aiMicroservice = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_BASE_URL || '/api/v1',
  timeout: 30000, 
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

    // Debug logging
    console.log('AI Request URL:', config.baseURL + (config.url || ''))

    // Convert camelCase request bodies to snake_case for backend
    if (config.data && !(config.data instanceof FormData)) {
      config.data = keysToSnakeCase(config.data)
    }
    
    // Convert camelCase query params to snake_case for backend
    if (config.params) {
      config.params = keysToSnakeCase(config.params)
    }

    return config
  },
  (error) => { throw error }
)

function maybeRetryAiRequest(config, error, client) {
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

function clearAiSessionIfUnauthorized(status) {
  if (status !== 401) return
  localStorage.removeItem(TOKEN_KEY)
  if (globalThis.location?.pathname?.includes('/login')) return
  globalThis.location.href = '/login'
}

async function handleAiFailure(error, client) {
  const retry = maybeRetryAiRequest(error.config, error, client)
  if (retry) return retry

  const config = error.config
  const status = error.response?.status
  const message = extractErrorMessage(error) || 'An unexpected error occurred'

  console.error('[AI SERVICE ERROR]', {
    url: config?.url,
    method: config?.method,
    status,
    message,
    retryCount: config?._retryCount || 0,
  })

  clearAiSessionIfUnauthorized(status)

  const enhanced = new Error(message)
  enhanced.response = error.response
  enhanced.status = status
  throw enhanced
}

// ─── Response Interceptor ────────────────────────────────────────────────────
aiMicroservice.interceptors.response.use(
  (response) => {
    if (!response) return null
    
    let unwrappedData = response.data
    if (unwrappedData && typeof unwrappedData === 'object' && 'data' in unwrappedData) {
      unwrappedData = unwrappedData.data
    }
    
    // Normalize snake_case response to camelCase for frontend
    return keysToCamelCase(unwrappedData)
  },
  async (error) => handleAiFailure(error, aiMicroservice)
)

export default aiMicroservice
