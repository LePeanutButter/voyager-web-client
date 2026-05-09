/**
 * Coordenadas y código de ciudad Amadeus aproximados según texto de destino del plan.
 * Sirve para /catalog/activities y /catalog/hotels/by-city en demo sin geocodificador.
 */
const HINTS = [
  { re: /par[ií]s/i, lat: 48.8566, lng: 2.3522, cityCode: 'PAR', label: 'París' },
  { re: /barcelona/i, lat: 41.3851, lng: 2.1734, cityCode: 'BCN', label: 'Barcelona' },
  { re: /madrid/i, lat: 40.4168, lng: -3.7038, cityCode: 'MAD', label: 'Madrid' },
  { re: /valencia/i, lat: 39.4699, lng: -0.3763, cityCode: 'VLC', label: 'Valencia' },
  { re: /sevilla/i, lat: 37.3891, lng: -5.9845, cityCode: 'SVQ', label: 'Sevilla' },
  { re: /london|londres/i, lat: 51.5074, lng: -0.1278, cityCode: 'LON', label: 'Londres' },
  { re: /roma|rome|roma/i, lat: 41.9028, lng: 12.4964, cityCode: 'FCO', label: 'Roma' },
  { re: /tokyo|tokio/i, lat: 35.6762, lng: 139.6503, cityCode: 'NRT', label: 'Tokio' },
  { re: /lisboa|lisbon/i, lat: 38.7223, lng: -9.1393, cityCode: 'LIS', label: 'Lisboa' },
  {
    re: /ciudad\s*de\s*m[eé]xico|mexico\s*city|cdmx|ciudad\s*de\s*mexico/i,
    lat: 19.4326,
    lng: -99.1332,
    cityCode: 'MEX',
    label: 'Ciudad de México',
  },
  { re: /berlin|berl[ií]n/i, lat: 52.52, lng: 13.405, cityCode: 'BER', label: 'Berlín' },
  { re: /amsterdam/i, lat: 52.3676, lng: 4.9041, cityCode: 'AMS', label: 'Ámsterdam' },
  { re: /praga|prague/i, lat: 50.0755, lng: 14.4378, cityCode: 'PRG', label: 'Praga' },
  { re: /atenas|athens/i, lat: 37.9838, lng: 23.7275, cityCode: 'ATH', label: 'Atenas' },
  { re: /dublin/i, lat: 53.3498, lng: -6.2603, cityCode: 'DUB', label: 'Dublín' },
  { re: /nueva\s*york|new\s*york|nyc/i, lat: 40.7128, lng: -74.006, cityCode: 'NYC', label: 'Nueva York' },
  { re: /zurich|z[uü]rich/i, lat: 47.3769, lng: 8.5417, cityCode: 'ZRH', label: 'Zúrich' },
  { re: /oaxaca/i, lat: 17.0732, lng: -96.7266, cityCode: 'OAX', label: 'Oaxaca' },
]

const DEFAULT_HINT = { lat: 40.4168, lng: -3.7038, cityCode: 'MAD', label: 'Madrid (por defecto)' }

/**
 * Normaliza IDs tipo backend (`dst_barcelona`) a texto buscable en hints.
 * @param {string|null|undefined} raw
 * @returns {string}
 */
export function normalizeDestinationSlugForSearch(raw) {
  if (raw == null) return ''
  let s = String(raw).trim()
  if (!s) return ''
  if (/^dst_/i.test(s)) {
    s = s.slice(4).replaceAll('_', ' ')
  }
  return s
}

/**
 * @param {string|null|undefined} destinationText
 * @returns {{ lat: number, lng: number, cityCode: string, label: string, matched: boolean }}
 */
export function resolveDestinationHint(destinationText) {
  const t = String(destinationText || '').trim()
  if (!t) {
    return { ...DEFAULT_HINT, matched: false }
  }
  for (const h of HINTS) {
    if (h.re.test(t)) {
      return { lat: h.lat, lng: h.lng, cityCode: h.cityCode, label: h.label, matched: true }
    }
  }
  return { ...DEFAULT_HINT, matched: false }
}
