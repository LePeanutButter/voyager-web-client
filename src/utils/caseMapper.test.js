import { describe, it, expect } from 'vitest'
import { keysToCamelCase, keysToSnakeCase } from './caseMapper'

describe('caseMapper', () => {
  it('keysToCamelCase nested', () => {
    expect(
      keysToCamelCase({ user_name: 'a', nested_obj: { foo_bar: 1 } }),
    ).toEqual({ userName: 'a', nestedObj: { fooBar: 1 } })
  })

  it('keysToCamelCase arrays and primitives', () => {
    expect(keysToCamelCase([{ a_b: 1 }])).toEqual([{ aB: 1 }])
    expect(keysToCamelCase(3)).toBe(3)
    expect(keysToCamelCase(null)).toBeNull()
  })

  it('keysToCamelCase leaves Date as value', () => {
    const d = new Date('2020-01-01')
    expect(keysToCamelCase({ created_at: d }).createdAt).toBe(d)
  })

  it('keysToSnakeCase', () => {
    expect(keysToSnakeCase({ userName: 'x', innerKey: { fooBar: 2 } })).toEqual({
      user_name: 'x',
      inner_key: { foo_bar: 2 },
    })
  })
})
