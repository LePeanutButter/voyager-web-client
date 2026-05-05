import { useState, useCallback, useEffect } from 'react'
import { travelService } from '../services/travelService'
import { extractErrorMessage } from '../utils/errorUtils'

/**
 * Custom hook for travel plan CRUD operations.
 *
 * @param {boolean} autoLoad - If true, fetches plans immediately on mount.
 * @returns {{ plans, loading, error, create, update, remove, updateStatus, refresh }}
 */
export function useTravelPlans(autoLoad = false) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => setError(null), [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await travelService.list()
      // Handle both paged and direct array responses
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.content)
        ? result.content
        : []
      setPlans(list)
      return list
    } catch (err) {
      setError(extractErrorMessage(err))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoLoad) refresh()
  }, [autoLoad, refresh])

  const create = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const created = await travelService.create(payload)
      setPlans((prev) => [created, ...prev])
      return created
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (id, payload) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await travelService.update(id, payload)
      setPlans((prev) => prev.map((p) => (String(p.id) === String(id) ? updated : p)))
      return updated
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await travelService.remove(id)
      setPlans((prev) => prev.filter((p) => String(p.id) !== String(id)))
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await travelService.updateStatus(id, status)
      setPlans((prev) => prev.map((p) => (String(p.id) === String(id) ? updated : p)))
      return updated
    } catch (err) {
      setError(extractErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    plans,
    loading,
    error,
    clearError,
    create,
    update,
    remove,
    updateStatus,
    refresh,
  }
}
