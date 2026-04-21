import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (requestOptions = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api({
        url,
        ...options,
        ...requestOptions
      })
      setData(response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, options])

  useEffect(() => {
    if (options.immediate !== false) {
      execute()
    }
  }, [execute, options.immediate])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return { data, loading, error, execute, refetch }
}

export const useLazyApi = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (requestOptions = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api({
        url,
        ...options,
        ...requestOptions
      })
      setData(response)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, options])

  return { data, loading, error, execute }
}
