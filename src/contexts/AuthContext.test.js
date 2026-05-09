import { describe, it, expect } from 'vitest'
import { useAuth as useAuthFromBarrel } from './AuthContext.js'
import { useAuth as useAuthDirect } from './use-auth.js'

describe('AuthContext re-export', () => {
  it('re-exporta useAuth desde el mismo módulo que use-auth', () => {
    expect(useAuthFromBarrel).toBe(useAuthDirect)
  })
})
