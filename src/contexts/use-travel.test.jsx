import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTravel } from './use-travel.js'

describe('useTravel context hook', () => {
  it('throws outside TravelProvider', () => {
    expect(() => renderHook(() => useTravel())).toThrow('useTravel must be used within a TravelProvider')
  })
})
