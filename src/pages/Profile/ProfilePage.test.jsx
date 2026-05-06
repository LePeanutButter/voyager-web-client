import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from './ProfilePage'

const profileHook = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => profileHook(),
}))

const baseProfile = {
  id: 1,
  firstName: 'A',
  lastName: 'B',
  username: 'ab',
  email: 'a@b.c',
  phoneNumber: '1',
  role: 'USER',
  bio: 'bio',
  interests: ['Adventure'],
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    profileHook.mockReturnValue({
      profile: baseProfile,
      loading: false,
      saving: false,
      error: null,
      success: null,
      save: vi.fn().mockResolvedValue(undefined),
      clearMessages: vi.fn(),
    })
  })

  it('shows profile and opens edit', async () => {
    render(<ProfilePage />)
    expect(screen.getByText(/my profile/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
  })

  it('loading skeleton', () => {
    profileHook.mockReturnValue({
      profile: null,
      loading: true,
      saving: false,
      error: null,
      success: null,
      save: vi.fn(),
      clearMessages: vi.fn(),
    })
    render(<ProfilePage />)
    expect(document.querySelector('.skeleton')).toBeTruthy()
  })
})
