import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./api', () => ({
  default: apiMock,
  TOKEN_KEY: 'voyager_token',
}))

import { authService } from './authService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('authService', () => {
  it('register', async () => {
    apiMock.post.mockResolvedValue({ id: 1 })
    await authService.register({ email: 'a@b.c' })
    expect(apiMock.post).toHaveBeenCalledWith('/users/register', { email: 'a@b.c' })
  })

  it('login', async () => {
    apiMock.post.mockResolvedValue({ token: 't' })
    await authService.login({ usernameOrEmail: 'u', password: 'p' })
    expect(apiMock.post).toHaveBeenCalledWith('/users/login', { usernameOrEmail: 'u', password: 'p' })
  })

  it('getCurrentUser', async () => {
    localStorage.setItem('voyager_user', JSON.stringify({ id: 42 }))
    apiMock.get.mockResolvedValue({})
    await authService.getCurrentUser()
    expect(apiMock.get).toHaveBeenCalledWith('/users/42')
  })

  it('getCurrentUser prefers userId from JWT over stale voyager_user', async () => {
    localStorage.setItem('voyager_token', 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjk5fQ.signature')
    localStorage.setItem('voyager_user', JSON.stringify({ id: 42 }))
    apiMock.get.mockResolvedValue({})
    await authService.getCurrentUser()
    expect(apiMock.get).toHaveBeenCalledWith('/users/99')
  })

  it('updateProfile', async () => {
    apiMock.put.mockResolvedValue({})
    await authService.updateProfile(7, { firstName: 'A' })
    expect(apiMock.put).toHaveBeenCalledWith('/users/7', { firstName: 'A' })
  })

  it('getUserById', async () => {
    apiMock.get.mockResolvedValue({})
    await authService.getUserById(3)
    expect(apiMock.get).toHaveBeenCalledWith('/users/3')
  })

  it('checkUsername / checkEmail', async () => {
    apiMock.get.mockResolvedValue(true)
    await authService.checkUsername('u')
    expect(apiMock.get).toHaveBeenCalledWith('/users/check-username', { params: { username: 'u' } })
    await authService.checkEmail('e@e.com')
    expect(apiMock.get).toHaveBeenCalledWith('/users/check-email', { params: { email: 'e@e.com' } })
  })

  it('getCurrentUser throws when no id is resolvable', async () => {
    await expect(authService.getCurrentUser()).rejects.toThrow(/current user id/)
  })

  it('admin user management endpoints', async () => {
    apiMock.put.mockResolvedValue({})
    apiMock.get.mockResolvedValue([])
    apiMock.delete.mockResolvedValue({})

    await authService.changePassword(1, 'old', 'new')
    expect(apiMock.put).toHaveBeenCalledWith('/users/1/password', null, {
      params: { currentPassword: 'old', newPassword: 'new' },
    })

    await authService.listUsers({ page: 0 })
    expect(apiMock.get).toHaveBeenCalledWith('/users', { params: { page: 0 } })

    await authService.getUsersByRole('ADMIN', { page: 1 })
    expect(apiMock.get).toHaveBeenCalledWith('/users/role/ADMIN', { params: { page: 1 } })

    await authService.getUsersByStatus('ACTIVE')
    expect(apiMock.get).toHaveBeenCalledWith('/users/status/ACTIVE', { params: {} })

    await authService.searchUsers('jane', { limit: 10 })
    expect(apiMock.get).toHaveBeenCalledWith('/users/search', {
      params: { searchTerm: 'jane', limit: 10 },
    })

    await authService.updateUserRole(1, 'BUSINESS')
    expect(apiMock.put).toHaveBeenCalledWith('/users/1/role', null, {
      params: { role: 'BUSINESS' },
    })

    await authService.updateUserStatus(1, 'BANNED')
    expect(apiMock.put).toHaveBeenCalledWith('/users/1/status', null, {
      params: { status: 'BANNED' },
    })

    await authService.deleteUser(1)
    expect(apiMock.delete).toHaveBeenCalledWith('/users/1')

    await authService.getUserStatistics()
    expect(apiMock.get).toHaveBeenCalledWith('/users/statistics')
  })

  it('getGoogleLoginUrl strips trailing /api/v1', () => {
    const url = authService.getGoogleLoginUrl()
    expect(url.endsWith('/api/v1/auth/google/login')).toBe(true)
  })
})
