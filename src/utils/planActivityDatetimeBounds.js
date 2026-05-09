/**
 * Límites datetime-local para actividades respecto a las fechas del plan (solo día, hora local).
 */

export function parsePlanLocalDay(dateInput) {
  if (!dateInput) return null
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const [y, m, d] = dateInput.slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const d = new Date(dateInput)
  return Number.isNaN(d.getTime()) ? null : d
}

export function planDayStartDatetimeLocal(dateInput) {
  const d = parsePlanLocalDay(dateInput)
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00`
}

export function planDayEndDatetimeLocal(dateInput) {
  const d = parsePlanLocalDay(dateInput)
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59`
}
