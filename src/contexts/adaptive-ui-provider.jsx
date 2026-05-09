import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from './use-auth.js'
import { aiService } from '../services/aiService'

const AdaptiveUIContext = createContext(null)

export function AdaptiveUIProvider({ children }) {
  const { user } = useAuth()
  const [menuData, setMenuData] = useState(null)
  const [feedLayout, setFeedLayout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    if (!user?.id) {
      setMenuData(null)
      setFeedLayout(null)
      setLoadError(null)
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const uid = String(user.id)
      const [menu, feed] = await Promise.all([
        aiService.getAdaptiveMenu(uid),
        aiService.getAdaptiveHomeFeed(uid),
      ])
      setMenuData(menu && typeof menu === 'object' ? menu : null)
      setFeedLayout(feed && typeof feed === 'object' ? feed : null)
    } catch (e) {
      setLoadError(e?.message || 'No se pudo cargar la UI adaptativa.')
      setMenuData(null)
      setFeedLayout(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  const clearLoadError = useCallback(() => setLoadError(null), [])

  const value = useMemo(
    () => ({
      menuData,
      feedLayout,
      loading,
      loadError,
      refetch: load,
      clearLoadError,
    }),
    [menuData, feedLayout, loading, loadError, load, clearLoadError]
  )

  return <AdaptiveUIContext.Provider value={value}>{children}</AdaptiveUIContext.Provider>
}

AdaptiveUIProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useAdaptiveUI() {
  const ctx = useContext(AdaptiveUIContext)
  if (!ctx) {
    throw new Error('useAdaptiveUI debe usarse dentro de AdaptiveUIProvider')
  }
  return ctx
}
