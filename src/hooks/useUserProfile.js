import { useState, useCallback, useEffect } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { extractErrorMessage } from '../utils/errorUtils'

/**
 * Custom hook for reading and updating the current user's profile.
 * Reads from AuthContext first, then validates against /users/me.
 */
export function useUserProfile() {
  const { user: contextUser, updateUser } = useAuth()
  const [profile, setProfile] = useState(contextUser || null)
  const [loading, setLoading] = useState(!contextUser)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  // Load fresh profile from server
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await authService.getCurrentUser()
      setProfile(user)
      updateUser(user)
      return user
    } catch (err) {
      setError(extractErrorMessage(err))
      return null
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  useEffect(() => {
    if (!contextUser) {
      refresh()
    } else {
      setProfile(contextUser)
      setLoading(false)
    }
  }, [contextUser, refresh])

  /**
   * Save profile changes to the server.
   * @param {{ firstName?, lastName?, phoneNumber?, bio?, interests? }} payload
   */
  const save = useCallback(
    async (payload) => {
      if (!profile?.id) return
      setSaving(true)
      setError(null)
      setSuccess(null)
      try {
        const updated = await authService.updateProfile(profile.id, payload)
        setProfile(updated)
        updateUser(updated)
        setSuccess('Profile updated successfully!')
        return updated
      } catch (err) {
        setError(extractErrorMessage(err))
        throw err
      } finally {
        setSaving(false)
      }
    },
    [profile?.id, updateUser]
  )

  return {
    profile,
    loading,
    saving,
    error,
    success,
    refresh,
    save,
    clearMessages,
  }
}
