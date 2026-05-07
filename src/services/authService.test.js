import { describe, it, expect, vi, beforeEach } from 'vitest'

const apiMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('./api', () => ({ default: apiMock }))

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
})
