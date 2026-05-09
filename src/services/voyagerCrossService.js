import { aiService } from './aiService'

/**
 * Orquestación front entre voyager-backend-core y voyager-ai-service.
 * Los microservicios no se sincronizan entre sí: el cliente llama a cada uno según el flujo.
 */

function normalizeUser(user) {
  if (!user?.id) return null
  return {
    id: String(user.id),
    email: String(user.email ?? ''),
    firstName: String(user.firstName ?? ''),
    lastName: String(user.lastName ?? ''),
    username: String(user.username ?? ''),
    name: String(user.name ?? ''),
    role: String(user.role ?? 'USER'),
  }
}

function displayName(user) {
  const u = normalizeUser(user)
  if (!u) return 'Viajero'
  const joined = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  if (joined) return joined
  if (u.name) return u.name
  if (u.username) return u.username
  return 'Viajero'
}

function emailForAi(user) {
  const u = normalizeUser(user)
  if (!u) return null
  const e = u.email.trim()
  if (e.includes('@') && e.split('@')[1]?.length > 0) return e
  return `${u.id}@user.voyager.local`
}

/**
 * Payload POST `/api/v1/users/profile` (camelCase; el interceptor lo pasa a snake_case).
 * @param {object} user — usuario del contexto (sanitizado) o respuesta cruda del backend
 */
export function buildAiUserProfilePayload(user) {
  const u = normalizeUser(user)
  if (!u) throw new Error('Usuario sin id')
  return {
    userId: u.id,
    name: displayName(user),
    email: emailForAi(user),
    preferences: {
      preferences: [],
      budgetRange: { min: 50, max: 200 },
      travelStyle: 'mid-range',
      groupSize: 2,
      accessibilityNeeds: [],
      dietaryRestrictions: [],
      languagePreferences: ['Spanish'],
    },
    travelHistory: [],
  }
}

/**
 * Body POST `/api/v1/matching/profiles/ingest` (un solo perfil por usuario Voyager).
 */
export function buildMatchingIngestPayload(user) {
  const u = normalizeUser(user)
  if (!u) throw new Error('Usuario sin id')
  return {
    profiles: [
      {
        userId: u.id,
        name: displayName(user),
        location: null,
        preferences: [],
      },
    ],
  }
}

function httpStatus(err) {
  return err?.status ?? err?.response?.status
}

/**
 * Crea el perfil en IA si no existe (404) y registra/actualiza la ficha en matching (upsert por ingest).
 * No relanza errores: el login o la app principal no deben fallar si el microservicio IA no está disponible.
 *
 * @param {object|null|undefined} user
 */
export async function provisionUserAcrossAiServices(user) {
  const u = normalizeUser(user)
  if (!u) return

  try {
    try {
      await aiService.getUserProfile(u.id)
    } catch (err) {
      if (httpStatus(err) !== 404) throw err
      await aiService.createUserProfile(buildAiUserProfilePayload(user))
    }

    await aiService.ingestMatchingProfiles(buildMatchingIngestPayload(user))
  } catch (err) {
    console.warn(
      '[voyagerCrossService] IA no aprovisionada (el backend principal sigue siendo la fuente de verdad):',
      err?.message || err
    )
  }
}
