/**
 * Normaliza respuestas de listas de viajeros (Spring paginado o array plano).
 * @param {unknown} raw
 * @returns {Array<object>}
 */
export function normalizeTravelerListResponse(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.content)) return raw.content
  if (Array.isArray(raw.records)) return raw.records
  if (Array.isArray(raw.data)) return raw.data
  return []
}

const safeParseJson = (value) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const resolveRecommendations = (buddyPayload) => {
  const normalized = safeParseJson(buddyPayload)
  const maybeData = safeParseJson(normalized?.data)
  const container = maybeData && typeof maybeData === 'object' ? maybeData : normalized
  const recs = container?.recommendations ?? normalized?.recommendations ?? []
  return Array.isArray(recs) ? recs : []
}

function upsertAiBuddyEntry(byId, r, planDestination) {
  const uid = r.userId ?? r.user_id ?? r.id
  if (uid == null) return
  const id = String(uid)
  const name = String(r.name || '').trim()
  const parts = name.split(/\s+/)
  const fn = parts[0] || 'Viajero'
  const ln = parts.slice(1).join(' ')
  const sharedRaw = r.sharedDestinations ?? r.shared_destinations ?? []
  const shared = Array.isArray(sharedRaw) ? [...sharedRaw] : []
  const aiScore = Number(r.compatibilityScore ?? r.compatibility_score ?? 0.75)

  if (byId.has(id)) {
    const existing = byId.get(id)
    if (aiScore > (existing.compatibilityScore || 0)) {
      existing.compatibilityScore = aiScore
    }
    if (existing.source === 'backend') {
      existing.source = 'both'
    }
    if (shared.length) {
      existing.sharedDestinations = [...new Set([...(existing.sharedDestinations || []), ...shared])]
    }
    return
  }

  byId.set(id, {
    userId: uid,
    firstName: fn,
    lastName: ln,
    username: r.username ?? `user_${id}`,
    compatibilityScore: aiScore,
    travelPlanTitle: null,
    destinationLocation: planDestination || null,
    travelStartDate: null,
    travelEndDate: null,
    sharedDestinations: shared,
    source: 'ai',
  })
}

/**
 * Combina candidatos del backend (planes solapados) con recomendaciones del servicio de IA.
 * @param {Array<object>} compatList
 * @param {unknown} buddyPayload
 * @param {string|null|undefined} planDestination
 * @param {string|number|null|undefined} currentUserId
 */
export function mergeDiscoveryMatches(compatList, buddyPayload, planDestination, currentUserId) {
  const byId = new Map()
  const addBackend = (m) => {
    const uid = m.userId ?? m.user_id ?? m.id
    if (uid == null) return
    const shared = m.sharedDestinations ?? m.shared_destinations ?? []
    byId.set(String(uid), {
      userId: uid,
      firstName: m.firstName ?? m.first_name ?? 'Viajero',
      lastName: m.lastName ?? m.last_name ?? '',
      username: m.username ?? `user_${uid}`,
      compatibilityScore: Number(m.compatibilityScore ?? m.compatibility_score ?? 0),
      travelPlanTitle: m.travelPlanTitle ?? m.travel_plan_title ?? null,
      destinationLocation: m.destinationLocation ?? m.destination_location ?? null,
      travelStartDate: m.travelStartDate ?? m.travel_start_date ?? null,
      travelEndDate: m.travelEndDate ?? m.travel_end_date ?? null,
      sharedDestinations: Array.isArray(shared) ? [...shared] : [],
      source: 'backend',
    })
  }
  for (const m of compatList || []) addBackend(m)

  const recs = resolveRecommendations(buddyPayload)

  for (const r of recs) {
    upsertAiBuddyEntry(byId, r, planDestination)
  }

  return Array.from(byId.values())
    .filter((m) => currentUserId == null || String(m.userId) !== String(currentUserId))
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
}
