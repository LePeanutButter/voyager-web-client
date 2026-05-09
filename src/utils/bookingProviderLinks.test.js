import { describe, it, expect } from 'vitest'
import { getBookingProviderLinks } from './bookingProviderLinks'

describe('getBookingProviderLinks', () => {
  it('builds links from title + destination', () => {
    const links = getBookingProviderLinks({ title: 'Verano en Paris', destination: 'Paris' })
    expect(links.map((l) => l.id)).toEqual(['booking', 'airbnb', 'google', 'tripadvisor'])
    expect(links[0].href).toContain(encodeURIComponent('Paris'))
    expect(links[1].href).toContain(encodeURIComponent('Paris'))
    expect(links[2].href).toContain(encodeURIComponent('Verano en Paris Paris'))
    expect(links[3].href).toContain(encodeURIComponent('Verano en Paris'))
  })

  it('falls back to cityLabel when destination is missing', () => {
    const links = getBookingProviderLinks({ title: 'Trip', cityLabel: 'Madrid' })
    expect(links[0].href).toContain('Madrid')
  })

  it('uses default placeholder when nothing provided', () => {
    const links = getBookingProviderLinks()
    expect(links).toHaveLength(4)
    expect(links[0].href).toContain('viaje')
  })

  it('falls back to destination when title is missing', () => {
    const links = getBookingProviderLinks({ destination: 'Roma' })
    expect(links[3].href).toContain('Roma')
  })
})
