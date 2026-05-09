import { describe, it, expect } from 'vitest'
import {
  ADAPTIVE_NAV_ROUTES,
  buildAdaptiveSidebarEntries,
  buildAdaptiveHeaderLinks,
} from './adaptiveUiNav'

describe('ADAPTIVE_NAV_ROUTES', () => {
  it('exposes core navigation entries', () => {
    expect(ADAPTIVE_NAV_ROUTES.home.path).toBe('/dashboard')
    expect(ADAPTIVE_NAV_ROUTES.profile.path).toBe('/profile')
  })
})

describe('buildAdaptiveSidebarEntries', () => {
  it('returns null when there are no items', () => {
    expect(buildAdaptiveSidebarEntries(null)).toBeNull()
    expect(buildAdaptiveSidebarEntries({})).toBeNull()
  })

  it('builds ordered entries plus calendar/settings tail', () => {
    const result = buildAdaptiveSidebarEntries({
      primaryItems: [
        { navItemId: 'home', tier: 'PRIMARY' },
        { nav_item_id: 'discover', tier: 'primary' },
        { navItemId: 'home' }, // duplicate -> skipped
      ],
      secondaryItems: [
        { navItemId: 'profile', adaptation_reason: 'usage', usage_score: 0.9 },
        { navItemId: 'unknown' }, // not in catalog -> skipped
      ],
    })
    expect(result.entries.map((e) => e.path)).toEqual([
      '/dashboard',
      '/social',
      '/profile',
    ])
    expect(result.entries[0].tier).toBe('primary')
    expect(result.entries[2].adaptationReason).toBe('usage')
    expect(result.entries[2].usageScore).toBe(0.9)
    expect(result.fixedTail.map((t) => t.path)).toEqual(['/calendar', '/settings'])
  })

  it('includes business tail entry when allowed', () => {
    const result = buildAdaptiveSidebarEntries(
      { primaryItems: [{ navItemId: 'home' }] },
      { canAccessBusiness: true },
    )
    expect(result.fixedTail.map((t) => t.path)).toContain('/business-dashboard')
  })

  it('skips items without a navItemId', () => {
    const result = buildAdaptiveSidebarEntries({ primaryItems: [{}, { navItemId: 123 }] })
    expect(result.entries).toEqual([])
  })
})

describe('buildAdaptiveHeaderLinks', () => {
  it('returns null without primary items', () => {
    expect(buildAdaptiveHeaderLinks(null)).toBeNull()
    expect(buildAdaptiveHeaderLinks({ primaryItems: [] })).toBeNull()
  })

  it('returns up to max links and uses headerLabel', () => {
    const links = buildAdaptiveHeaderLinks(
      {
        primaryItems: [
          { navItemId: 'home' },
          { nav_item_id: 'discover' },
          { navItemId: 'profile' },
          { navItemId: 'home' }, // duplicate
        ],
      },
      2,
    )
    expect(links).toEqual([
      { to: '/dashboard', label: 'Inicio' },
      { to: '/social', label: 'Descubrir' },
    ])
  })

  it('returns null if fewer than two valid entries', () => {
    expect(
      buildAdaptiveHeaderLinks({ primaryItems: [{ navItemId: 'home' }] }),
    ).toBeNull()
  })
})
