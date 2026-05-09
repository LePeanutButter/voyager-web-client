import { describe, it, expect, vi, beforeEach } from 'vitest'

const aiMock = vi.hoisted(() => ({
  getUserProfile: vi.fn(),
  createUserProfile: vi.fn(),
  ingestMatchingProfiles: vi.fn(),
}))

vi.mock('./aiService', () => ({ aiService: aiMock }))

import {
  buildAiUserProfilePayload,
  buildMatchingIngestPayload,
  provisionUserAcrossAiServices,
} from './voyagerCrossService'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('voyagerCrossService', () => {
  it('buildAiUserProfilePayload', () => {
    const p = buildAiUserProfilePayload({
      id: 9,
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Lopez',
      username: 'ana',
      role: 'USER',
    })
    expect(p.userId).toBe('9')
    expect(p.email).toBe('a@b.com')
    expect(p.name).toBe('Ana Lopez')
    expect(p.preferences.languagePreferences).toEqual(['Spanish'])
  })

  it('buildAiUserProfilePayload uses placeholder email', () => {
    const p = buildAiUserProfilePayload({
      id: 42,
      email: '',
      firstName: '',
      lastName: '',
      username: 'x',
      role: 'USER',
    })
    expect(p.email).toBe('42@user.voyager.local')
  })

  it('buildMatchingIngestPayload', () => {
    const b = buildMatchingIngestPayload({
      id: '1',
      email: 'e@e.com',
      firstName: 'E',
      lastName: '',
      username: 'e',
      role: 'USER',
    })
    expect(b.profiles).toHaveLength(1)
    expect(b.profiles[0].userId).toBe('1')
  })

  it('provisionUserAcrossAiServices creates when 404', async () => {
    aiMock.getUserProfile.mockRejectedValueOnce(Object.assign(new Error('nf'), { status: 404 }))
    aiMock.createUserProfile.mockResolvedValue({})
    aiMock.ingestMatchingProfiles.mockResolvedValue({})
    await provisionUserAcrossAiServices({
      id: 7,
      email: 'u@u.com',
      firstName: 'U',
      lastName: '',
      username: 'u',
      role: 'USER',
    })
    expect(aiMock.createUserProfile).toHaveBeenCalled()
    expect(aiMock.ingestMatchingProfiles).toHaveBeenCalled()
  })

  it('provisionUserAcrossAiServices skips create when profile exists', async () => {
    aiMock.getUserProfile.mockResolvedValue({ userId: '7' })
    aiMock.ingestMatchingProfiles.mockResolvedValue({})
    await provisionUserAcrossAiServices({
      id: 7,
      email: 'u@u.com',
      firstName: 'U',
      lastName: '',
      username: 'u',
      role: 'USER',
    })
    expect(aiMock.createUserProfile).not.toHaveBeenCalled()
    expect(aiMock.ingestMatchingProfiles).toHaveBeenCalled()
  })

  it('provisionUserAcrossAiServices swallows IA errors', async () => {
    aiMock.getUserProfile.mockRejectedValue(Object.assign(new Error('down'), { status: 503 }))
    await expect(
      provisionUserAcrossAiServices({
        id: 1,
        email: 'a@a.com',
        firstName: 'A',
        lastName: '',
        username: 'a',
        role: 'USER',
      })
    ).resolves.toBeUndefined()
  })

  it('provisionUserAcrossAiServices is a no-op when user has no id', async () => {
    await expect(provisionUserAcrossAiServices(null)).resolves.toBeUndefined()
    await expect(provisionUserAcrossAiServices({})).resolves.toBeUndefined()
    expect(aiMock.getUserProfile).not.toHaveBeenCalled()
  })

  it('buildAiUserProfilePayload throws when user has no id', () => {
    expect(() => buildAiUserProfilePayload({})).toThrow(/sin id/)
    expect(() => buildMatchingIngestPayload(null)).toThrow(/sin id/)
  })

  it('display name falls back to name then username then default', () => {
    const onlyName = buildAiUserProfilePayload({ id: 1, name: 'Solo', email: 'x@y.z' })
    expect(onlyName.name).toBe('Solo')
    const onlyUsername = buildAiUserProfilePayload({ id: 1, username: 'usr', email: '' })
    expect(onlyUsername.name).toBe('usr')
    const blank = buildAiUserProfilePayload({ id: 1 })
    expect(blank.name).toBe('Viajero')
  })

  it('uses HTTP status from response.status when present', async () => {
    aiMock.getUserProfile.mockRejectedValue({ response: { status: 404 } })
    aiMock.createUserProfile.mockResolvedValue({})
    aiMock.ingestMatchingProfiles.mockResolvedValue({})
    await provisionUserAcrossAiServices({
      id: 5,
      email: 'a@a.com',
      firstName: 'A',
      lastName: '',
      username: 'a',
      role: 'USER',
    })
    expect(aiMock.createUserProfile).toHaveBeenCalled()
  })
})
