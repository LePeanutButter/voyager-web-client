import { useMemo, useState, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/use-auth.js'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { aiService } from '../../services/aiService'
import { CatalogDestinationsPanel } from '../../components/Catalog/CatalogDestinationsPanel'
import { normalizeDestinationSlugForSearch } from '../../utils/destinationGeoHints'
import ErrorBanner from '../../components/UI/ErrorBanner'
import { extractErrorMessage } from '../../utils/errorUtils'
import '../TravelDetails/TravelDetails.css'
import './DestinationExplorePage.css'

function DestinationExplorePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plans, loading: plansLoading } = useTravelPlans(true)

  const locRaw = searchParams.get('loc') || ''
  const countryRaw = searchParams.get('country') || ''
  const destId = searchParams.get('destId') || ''

  const destinationLabel = useMemo(() => {
    const a = (normalizeDestinationSlugForSearch(locRaw) || locRaw).trim()
    const b = countryRaw.trim()
    if (a && b) return `${a}, ${b}`
    return a || b || 'Destino'
  }, [locRaw, countryRaw])

  const syntheticPlan = useMemo(
    () => ({
      id: destId || 'explore',
      title: destinationLabel,
      destinationLocation: destinationLabel,
    }),
    [destId, destinationLabel]
  )

  const primaryPlace = useMemo(() => destinationLabel.split(',')[0].trim().toLowerCase(), [destinationLabel])

  const matchingPlans = useMemo(() => {
    if (!primaryPlace) return plans
    return plans.filter((p) => (p.destinationLocation || '').toLowerCase().includes(primaryPlace))
  }, [plans, primaryPlace])

  const [catalogActivities, setCatalogActivities] = useState([])
  const [rankItems, setRankItems] = useState([])
  const [rankLoading, setRankLoading] = useState(false)
  const [rankError, setRankError] = useState(null)

  const onCatalogLoaded = useCallback(({ activities }) => {
    setCatalogActivities(activities)
    setRankItems([])
    setRankError(null)
  }, [])

  const handlePickActivity = useCallback(
    (act) => {
      navigate('/travel-plans/create', {
        state: {
          exploreSeed: {
            destinationLocation: destinationLabel,
            activityName: act.name,
            activityDescription: act.description || '',
          },
        },
      })
    },
    [navigate, destinationLabel]
  )

  const runAiRank = useCallback(async () => {
    if (!user?.id) {
      setRankError('Inicia sesión para obtener recomendaciones priorizadas con IA.')
      return
    }
    if (catalogActivities.length === 0) return
    setRankLoading(true)
    setRankError(null)
    try {
      const candidates = catalogActivities.map((act) => ({
        id: String(act.id),
        name: act.name,
        category: 'catalog_activity',
        contentText: act.description || act.name,
      }))
      const res = await aiService.rankWithLocalRecommendations({
        userId: String(user.id),
        query: `Qué hacer en ${destinationLabel}: ordena por relevancia para un viajero`,
        limit: 5,
        candidates,
      })
      setRankItems(Array.isArray(res?.items) ? res.items : [])
    } catch (e) {
      setRankError(extractErrorMessage(e))
    } finally {
      setRankLoading(false)
    }
  }, [user?.id, catalogActivities, destinationLabel])

  const hasQuery = Boolean(locRaw.trim() || countryRaw.trim())

  if (!hasQuery) {
    return (
      <div className="page-container destination-explore-page">
        <button type="button" className="btn-back dest-explore-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Volver al dashboard
        </button>
        <ErrorBanner
          variant="error"
          message="No se indicó un destino. Ábrelo desde una tendencia en el dashboard."
        />
        <p className="dest-explore-fallback">
          <Link to="/dashboard">Ir al dashboard</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="page-container destination-explore-page">
      <button type="button" className="btn-back dest-explore-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Volver
      </button>
      <header className="dest-explore-header">
        <p className="dest-explore-eyebrow">Explorar destino</p>
        <h1>{destinationLabel}</h1>
        {destId ? <p className="dest-explore-meta">Referencia tendencias / catálogo: {destId}</p> : null}
        <p className="dest-explore-intro">
          Mismo catálogo de actividades y hoteles que en tus planes. Crea un plan con una idea del listado u
          ordena las experiencias con IA según tu perfil.
        </p>
      </header>

      <CatalogDestinationsPanel
        plan={syntheticPlan}
        onPickCatalogActivity={handlePickActivity}
        pickButtonLabel="Crear plan con esta idea"
        onCatalogDataLoaded={onCatalogLoaded}
      />

      <div className="section-card dest-explore-section">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h2>Planes recomendados (IA)</h2>
          </div>
          <button
            type="button"
            className="btn-outline-sm dest-explore-rank-btn"
            onClick={runAiRank}
            disabled={rankLoading || catalogActivities.length === 0}
          >
            {rankLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden /> Rankeando…
              </>
            ) : (
              'Ordenar catálogo con IA'
            )}
          </button>
        </div>
        {rankError ? (
          <ErrorBanner variant="error" message={rankError} onDismiss={() => setRankError(null)} />
        ) : null}
        {catalogActivities.length === 0 ? (
          <p className="catalog-muted">Cuando cargue el catálogo podrás pedir un ranking con IA.</p>
        ) : null}
        {rankItems.length > 0 ? (
          <ol className="dest-explore-rank-list">
            {rankItems.map((it, i) => (
              <li key={it.id || `${i}-${it.name}`}>
                <strong>{it.name || it.title || it.id}</strong>
                {it.score === null || it.score === undefined ? null : (
                  <span className="dest-explore-score">{Number(it.score).toFixed(2)}</span>
                )}
                {it.reason ? <p className="dest-explore-reason">{it.reason}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="section-card dest-explore-section">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <h2>Tus planes hacia este destino</h2>
          </div>
        </div>
        {(() => {
          if (plansLoading) {
            return <p className="catalog-muted">Cargando tus planes…</p>
          }
          if (matchingPlans.length === 0) {
            return (
              <p className="catalog-muted">
                No hay planes que coincidan con este destino. Crea uno con el botón de cada actividad o desde
                {' '}
                <Link to="/travel-plans/create">Nuevo plan</Link>.
              </p>
            )
          }
          return (
            <ul className="dest-explore-plans">
              {matchingPlans.map((p) => (
                <li key={p.id}>
                  <Link to={`/travel-plans/${p.id}`}>{p.title || `Plan ${p.id}`}</Link>
                  <span className="dest-explore-muted">{p.destinationLocation}</span>
                </li>
              ))}
            </ul>
          )
        })()}
      </div>
    </div>
  )
}

export default DestinationExplorePage
