import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { Globe, ExternalLink, Loader2 } from 'lucide-react'
import { travelService } from '../../services/travelService'
import { extractErrorMessage } from '../../utils/errorUtils'
import { resolveDestinationHint } from '../../utils/destinationGeoHints'
import { getBookingProviderLinks } from '../../utils/bookingProviderLinks'
import {
  extractActivitiesPayload,
  extractHotelsPayload,
  normalizeCatalogActivity,
  normalizeHotelRef,
} from '../../utils/amadeusCatalog'
import {
  CATALOG_REFRESH_COOLDOWN_MS,
  checkCatalogRefreshAllowed,
  recordCatalogManualRefresh,
} from '../../utils/catalogRefreshLimiter'

async function fetchCatalogPayloads(hint) {
  return Promise.all([
    travelService.getActivitiesByGeo({
      latitude: hint.lat,
      longitude: hint.lng,
      radius: 40,
      radiusUnit: 'KM',
    }),
    travelService.getHotelsByCity(hint.cityCode).catch(() => null),
  ])
}

function normalizeCatalogActivityRows(actPayload) {
  return extractActivitiesPayload(actPayload)
    .map(normalizeCatalogActivity)
    .filter(Boolean)
    .slice(0, 14)
}

function normalizeCatalogHotelRows(hotelPayload) {
  if (!hotelPayload) return []
  const raw = extractHotelsPayload(hotelPayload)
  return raw.map(normalizeHotelRef).filter(Boolean).slice(0, 10)
}

function applyManualCatalogSuccess({
  actRows,
  hotelRows,
  refreshAttemptsRef,
  setCooldownUntil,
  setCatalogNotice,
}) {
  recordCatalogManualRefresh(refreshAttemptsRef)
  setCooldownUntil(Date.now() + CATALOG_REFRESH_COOLDOWN_MS)
  if (actRows.length === 0 && hotelRows.length === 0) {
    setCatalogNotice(
      'No hay actividades ni hoteles en el catálogo para esta zona. Puedes usar los enlaces de reserva en cada tarjeta o probar más tarde.'
    )
  } else {
    setCatalogNotice(null)
  }
}

/**
 * Catálogo Amadeus (actividades geo + hoteles por ciudad) según texto de destino del plan.
 */
export function CatalogDestinationsPanel({
  plan,
  onPickCatalogActivity,
  pickButtonLabel = 'Añadir al plan',
  onCatalogDataLoaded,
}) {
  const hint = useMemo(
    () => resolveDestinationHint(plan?.destinationLocation),
    [plan?.destinationLocation]
  )
  const [activities, setActivities] = useState([])
  const [hotels, setHotels] = useState([])
  const [initialLoading, setInitialLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [catalogError, setCatalogError] = useState(null)
  const [catalogNotice, setCatalogNotice] = useState(null)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [cooldownTick, setCooldownTick] = useState(0)
  const refreshAttemptsRef = useRef([])

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined
    const id = setInterval(() => setCooldownTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [cooldownUntil])

  const cooldownLeftSec = useMemo(() => {
    void cooldownTick
    return cooldownUntil > Date.now()
      ? Math.ceil((cooldownUntil - Date.now()) / 1000)
      : 0
  }, [cooldownUntil, cooldownTick])

  const loadCatalog = useCallback(
    async ({ manual = false } = {}) => {
      if (manual) {
        const gate = checkCatalogRefreshAllowed(refreshAttemptsRef)
        if (!gate.ok) {
          const sec = Math.max(1, Math.ceil(gate.retryAfterMs / 1000))
          setCatalogNotice(
            gate.code === 'rate'
              ? `Límite de actualizaciones alcanzado. Prueba en ${sec} s.`
              : `Espera ${sec} s antes de volver a actualizar.`
          )
          return
        }
        setCatalogNotice(null)
        setRefreshing(true)
      } else {
        setInitialLoading(true)
      }
      setCatalogError(null)
      try {
        const [actPayload, hotelPayload] = await fetchCatalogPayloads(hint)
        const actRows = normalizeCatalogActivityRows(actPayload)
        setActivities(actRows)
        const hotelRows = normalizeCatalogHotelRows(hotelPayload)
        setHotels(hotelRows)
        onCatalogDataLoaded?.({ activities: actRows, hotels: hotelRows })
        if (manual) {
          applyManualCatalogSuccess({
            actRows,
            hotelRows,
            refreshAttemptsRef,
            setCooldownUntil,
            setCatalogNotice,
          })
        }
      } catch (e) {
        setCatalogError(extractErrorMessage(e))
        if (!manual) {
          setActivities([])
          setHotels([])
        }
      } finally {
        if (manual) setRefreshing(false)
        else setInitialLoading(false)
      }
    },
    [hint, onCatalogDataLoaded]
  )

  useEffect(() => {
    loadCatalog({ manual: false })
  }, [loadCatalog])

  const refreshDisabled = refreshing || cooldownLeftSec > 0

  return (
    <div className="section-card catalog-section">
      <div className="section-card-header">
        <div className="flex items-center gap-2">
          <Globe size={18} />
          <h2>Catálogo y reservas</h2>
        </div>
        <button
          type="button"
          className="btn-outline-sm catalog-refresh-btn"
          onClick={() => loadCatalog({ manual: true })}
          disabled={refreshDisabled}
          aria-busy={refreshing}
        >
          <span className="catalog-refresh-btn-inner">
            <Loader2
              size={16}
              className={`catalog-refresh-spinner${refreshing ? ' catalog-refresh-spinner--on' : ''}`}
              aria-hidden
            />
            <span className="catalog-refresh-label">
              {cooldownLeftSec > 0
                ? `Actualizar (${cooldownLeftSec}s)`
                : 'Actualizar catálogo'}
            </span>
          </span>
        </button>
      </div>
      {catalogError && (
        <p className="catalog-error" role="alert">
          {catalogError}
        </p>
      )}
      {catalogNotice && !catalogError && (
        <output className="catalog-notice">{catalogNotice}</output>
      )}

      <h3 className="catalog-subtitle">Actividades cercanas</h3>
      {initialLoading && activities.length === 0 ? (
        <p className="catalog-muted">Cargando ideas del catálogo…</p>
      ) : null}
      <div className="catalog-grid">
        {activities.map((act) => {
          const links = getBookingProviderLinks({
            title: act.name,
            destination: plan?.destinationLocation,
            cityLabel: hint.label,
          })
          return (
            <div key={act.id} className="catalog-card">
              <div className="catalog-card-body">
                <h4>{act.name}</h4>
                {act.description && <p className="catalog-desc">{act.description}</p>}
                <div className="catalog-meta">
                  {act.rating && <span className="catalog-pill">★ {act.rating}</span>}
                  {act.priceLabel && <span className="catalog-pill">{act.priceLabel}</span>}
                </div>
              </div>
              <div className="catalog-provider-row">
                {links.map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="catalog-provider-chip"
                  >
                    <ExternalLink size={12} /> {l.label}
                  </a>
                ))}
                {act.bookingLink && (
                  <a
                    href={act.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="catalog-provider-chip catalog-provider-chip--primary"
                  >
                    <ExternalLink size={12} /> Catálogo
                  </a>
                )}
              </div>
              <button
                type="button"
                className="btn-primary catalog-add-btn"
                onClick={() => onPickCatalogActivity(act)}
              >
                {pickButtonLabel}
              </button>
            </div>
          )
        })}
      </div>

      {hotels.length > 0 && (
        <>
          <h3 className="catalog-subtitle">Hoteles en la ciudad (referencias)</h3>
          <div className="catalog-grid catalog-grid--hotels">
            {hotels.map((h) => {
              const links = getBookingProviderLinks({
                title: h.name,
                destination: plan?.destinationLocation,
                cityLabel: hint.label,
              })
              return (
                <div key={h.hotelId} className="catalog-card catalog-card--compact">
                  <h4>{h.name}</h4>
                  <div className="catalog-provider-row">
                    {links.map((l) => (
                      <a
                        key={l.id}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="catalog-provider-chip"
                      >
                        <ExternalLink size={12} /> {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

CatalogDestinationsPanel.propTypes = {
  plan: PropTypes.object.isRequired,
  onPickCatalogActivity: PropTypes.func.isRequired,
  pickButtonLabel: PropTypes.string,
  onCatalogDataLoaded: PropTypes.func,
}
