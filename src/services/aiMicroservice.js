import axios from 'axios'

/**
 * HTTP client for the Voyager AI microservice (FastAPI).
 * Configure via VITE_AI_SERVICE_BASE_URL (must include /api/v1/ suffix).
 */
const aiMicroservice = axios.create({
  baseURL:
    import.meta.env.VITE_AI_SERVICE_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

aiMicroservice.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('smartrip_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

aiMicroservice.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data
    const msg =
      (typeof data?.detail === 'string' && data.detail) ||
      data?.message ||
      error.message ||
      'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default aiMicroservice
