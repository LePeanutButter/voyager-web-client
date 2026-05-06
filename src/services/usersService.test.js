import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

import { usersService } from './usersService'

beforeEach(() => vi.clearAllMocks())

describe('usersService', () => {
  it('register login getCurrentUser', async () => {
    apiMock.post.mockResolvedValue({})
    await usersService.register({})
    await usersService.login({})
    apiMock.get.mockResolvedValue({})
    await usersService.getCurrentUser()
    await usersService.getUserById(1)
    await usersService.updateUserById(1, {})
  })

  it('getUserByUsername tries fallbacks', async () => {
    apiMock.get.mockResolvedValueOnce({ ok: 1 })
    await expect(usersService.getUserByUsername('u')).resolves.toEqual({ ok: 1 })

    apiMock.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: 2 })
    await expect(usersService.getUserByUsername('u2')).resolves.toEqual({ ok: 2 })

    apiMock.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ ok: 3 })
    await expect(usersService.getUserByUsername('u3')).resolves.toEqual({ ok: 3 })
  })

  it('getUserByEmail tries fallbacks', async () => {
    apiMock.get.mockResolvedValueOnce({ e: 1 })
    await expect(usersService.getUserByEmail('a@b.c')).resolves.toEqual({ e: 1 })

    apiMock.get.mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce({ e: 2 })
    await expect(usersService.getUserByEmail('x@y.z')).resolves.toEqual({ e: 2 })

    apiMock.get
      .mockRejectedValueOnce(new Error('x'))
      .mockRejectedValueOnce(new Error('y'))
      .mockResolvedValueOnce({ e: 3 })
    await expect(usersService.getUserByEmail('p@q.r')).resolves.toEqual({ e: 3 })
  })
})
