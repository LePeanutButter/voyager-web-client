/**
 * Alineación con el catálogo `nav_item_id` del voyager-ai-service (AdaptiveUIService._NAV_CATALOG).
 */

/** @type {Record<string, { path: string, label: string, headerLabel?: string }>} */
export const ADAPTIVE_NAV_ROUTES = {
  home: { path: '/dashboard', label: 'Panel', headerLabel: 'Inicio' },
  discover: { path: '/social', label: 'Descubrir', headerLabel: 'Descubrir' },
  matching: { path: '/social', label: 'Comunidad', headerLabel: 'Comunidad' },
  trips: { path: '/my-travels', label: 'Mis viajes', headerLabel: 'Experiencias' },
  chat: { path: '/ai-assistant', label: 'Asistente IA', headerLabel: 'IA' },
  bookmarks: { path: '/my-travels', label: 'Guardados', headerLabel: 'Guardados' },
  profile: { path: '/profile', label: 'Perfil', headerLabel: 'Perfil' },
  preferences: { path: '/travel-preferences', label: 'Preferencias IA', headerLabel: 'Preferencias' },
}

/**
 * @param {object|null|undefined} menuData respuesta camelCase de getAdaptiveMenu
 * @param {{ canAccessBusiness?: boolean }} opts
 * @returns {{ entries: Array<{ path: string, label: string, navItemId: string, tier: string, adaptationReason?: string, usageScore?: number }>, fixedTail: Array<{ path: string, label: string }> } | null}
 */
export function buildAdaptiveSidebarEntries(menuData, opts = {}) {
  const { canAccessBusiness = false } = opts
  const primary = menuData?.primaryItems
  const secondary = menuData?.secondaryItems
  if (!Array.isArray(primary) && !Array.isArray(secondary)) {
    return null
  }
  const ordered = [...(primary || []), ...(secondary || [])]
  const seenPaths = new Set()
  const entries = []

  for (const item of ordered) {
    const navItemId = item.navItemId ?? item.nav_item_id
    if (!navItemId || typeof navItemId !== 'string') continue
    const def = ADAPTIVE_NAV_ROUTES[navItemId]
    if (!def) continue
    if (seenPaths.has(def.path)) continue
    seenPaths.add(def.path)
    const tierRaw = item.tier
    const tier =
      typeof tierRaw === 'string'
        ? tierRaw.toLowerCase()
        : String(tierRaw ?? 'primary').toLowerCase()
    entries.push({
      path: def.path,
      label: def.label,
      navItemId,
      tier,
      adaptationReason: item.adaptationReason ?? item.adaptation_reason,
      usageScore: item.usageScore ?? item.usage_score,
    })
  }

  const fixedTail = []
  if (!seenPaths.has('/calendar')) {
    fixedTail.push({ path: '/calendar', label: 'Calendario' })
    seenPaths.add('/calendar')
  }
  if (!seenPaths.has('/settings')) {
    fixedTail.push({ path: '/settings', label: 'Configuracion' })
    seenPaths.add('/settings')
  }
  if (canAccessBusiness && !seenPaths.has('/business-dashboard')) {
    fixedTail.push({ path: '/business-dashboard', label: 'Negocios' })
  }

  return { entries, fixedTail }
}

/**
 * Enlaces compactos para la barra superior (usuarios autenticados).
 * @param {object|null|undefined} menuData
 * @param {number} [max]
 * @returns {Array<{ to: string, label: string }>|null} null = usar fallback del Header
 */
export function buildAdaptiveHeaderLinks(menuData, max = 4) {
  const primary = menuData?.primaryItems
  if (!Array.isArray(primary) || primary.length === 0) {
    return null
  }
  const out = []
  const seenPaths = new Set()
  for (const item of primary) {
    const navItemId = item.navItemId ?? item.nav_item_id
    const def = navItemId ? ADAPTIVE_NAV_ROUTES[navItemId] : null
    if (!def || seenPaths.has(def.path)) continue
    seenPaths.add(def.path)
    out.push({
      to: def.path,
      label: def.headerLabel || def.label,
    })
    if (out.length >= max) break
  }
  return out.length >= 2 ? out : null
}
