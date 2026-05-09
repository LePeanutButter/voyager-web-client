/**
 * Enlaces de búsqueda en proveedores externos (misma idea que chips en Booking / Airbnb).
 * @param {{ title?: string, destination?: string, cityLabel?: string }} ctx
 * @returns {Array<{ id: string, label: string, href: string }>}
 */
export function getBookingProviderLinks(ctx = {}) {
  const title = String(ctx.title || '').trim()
  const dest = String(ctx.destination || ctx.cityLabel || '').trim()
  const primary = title || dest || 'viaje'
  const q = encodeURIComponent(primary)
  const destEnc = encodeURIComponent(dest || primary)
  const both = encodeURIComponent(`${primary} ${dest}`.trim())

  return [
    {
      id: 'booking',
      label: 'Booking.com',
      href: `https://www.booking.com/searchresults.html?ss=${destEnc}`,
    },
    {
      id: 'airbnb',
      label: 'Airbnb',
      href: `https://www.airbnb.com/s/${destEnc}/homes`,
    },
    {
      id: 'google',
      label: 'Google',
      href: `https://www.google.com/search?q=${both}+hotel+reservas`,
    },
    {
      id: 'tripadvisor',
      label: 'Tripadvisor',
      href: `https://www.tripadvisor.com/Search?q=${q}`,
    },
  ]
}
