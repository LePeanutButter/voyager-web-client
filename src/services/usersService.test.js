import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock, TOKEN_KEY: 'voyager_token' }))

import { usersService } from './usersService'

beforeEach(() => vi.clearAllMocks())

describe('usersService', () => {
  it('register login getCurrentUser', async () => {
    localStorage.setItem('voyager_user', JSON.stringify({ id: 1 }))
    apiMock.post.mockResolvedValue({})
    await usersService.register({})
    await usersService.login({})
    apiMock.get.mockResolvedValue({})
    await usersService.getCurrentUser()
    expect(apiMock.get).toHaveBeenCalledWith('/users/1')
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

  it('getCurrentUser falls back to JWT-based id', async () => {
    localStorage.clear()
    localStorage.setItem('voyager_token', 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjU1fQ.signature')
    apiMock.get.mockResolvedValue({})
    await usersService.getCurrentUser()
    expect(apiMock.get).toHaveBeenCalledWith('/users/55')
  })

  it('getCurrentUser throws when there is no usable id', async () => {
    localStorage.clear()
    await expect(usersService.getCurrentUser()).rejects.toThrow(/current user id/)
  })

  it('admin endpoints', async () => {
    apiMock.get.mockResolvedValue([])
    apiMock.put.mockResolvedValue({})
    apiMock.delete.mockResolvedValue({})

    await usersService.listUsers({ page: 0 })
    expect(apiMock.get).toHaveBeenCalledWith('/users', { params: { page: 0 } })
    await usersService.getUsersByRole('USER')
    expect(apiMock.get).toHaveBeenCalledWith('/users/role/USER', { params: {} })
    await usersService.getUsersByStatus('ACTIVE', { sort: 'asc' })
    expect(apiMock.get).toHaveBeenCalledWith('/users/status/ACTIVE', { params: { sort: 'asc' } })
    await usersService.searchUsers('jane', { limit: 5 })
    expect(apiMock.get).toHaveBeenCalledWith('/users/search', {
      params: { searchTerm: 'jane', limit: 5 },
    })
    await usersService.updateUserRole(7, 'ADMIN')
    expect(apiMock.put).toHaveBeenCalledWith('/users/7/role', null, { params: { role: 'ADMIN' } })
    await usersService.updateUserStatus(7, 'BANNED')
    expect(apiMock.put).toHaveBeenCalledWith('/users/7/status', null, { params: { status: 'BANNED' } })
    await usersService.changePassword(7, 'old', 'new')
    expect(apiMock.put).toHaveBeenCalledWith('/users/7/password', null, {
      params: { currentPassword: 'old', newPassword: 'new' },
    })
    await usersService.deleteUser(7)
    expect(apiMock.delete).toHaveBeenCalledWith('/users/7')
    await usersService.getStatistics()
    expect(apiMock.get).toHaveBeenCalledWith('/users/statistics')
  })
})
