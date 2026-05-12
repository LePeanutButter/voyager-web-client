import { describe, it, expect, vi, beforeEach } from 'vitest'

const aiMock = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('./aiMicroservice', () => ({ default: aiMock }))

import { travelPreferencesService } from './travelPreferencesService'

beforeEach(() => vi.clearAllMocks())

describe('travelPreferencesService', () => {
  it('postQuestionnaireStep and submitQuestionnaire', async () => {
    aiMock.post.mockResolvedValue({ ok: 1 })
    await travelPreferencesService.postQuestionnaireStep({ user_id: '1' })
    await travelPreferencesService.submitQuestionnaire({ user_id: '1', session_id: 's' })
    expect(aiMock.post).toHaveBeenCalledTimes(2)
  })
})
