import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import { useAuth } from '../../contexts/use-auth.js'
import { aiService } from '../../services/aiService'
import { Brain, Users, Sparkles, ArrowRight, Compass, MessageCircle, Plane, Loader2 } from 'lucide-react'
import './Home.css'
import { destinationExplorePath } from '../../utils/destinationExploreNavigation'

const asArray = (v) => (Array.isArray(v) ? v : [])

function Home() {
  const { user } = useAuth()
  const [recoLoading, setRecoLoading] = useState(true)
  const [recoError, setRecoError] = useState(null)
  const [recoCards, setRecoCards] = useState([])

  const [buddiesLoading, setBuddiesLoading] = useState(false)
  const [buddies, setBuddies] = useState([])

  useEffect(() => {
    if (!user?.id) {
      setRecoLoading(false)
      setRecoError(null)
      setRecoCards([])
      return
    }
    let cancelled = false
    ;(async () => {
      setRecoLoading(true)
      setRecoError(null)
      try {
        const [dash, digest] = await Promise.all([
          aiService.getTrendsDashboard(),
          aiService.getWeeklyTrendsDigest(),
        ])
        if (cancelled) return

        const emerging = asArray(dash?.emergingDestinations)
        const micro = asArray(digest?.microTrends)

        const fromEmerging = emerging.map((d) => ({
          key: `em-${d.destinationId ?? d.name}`,
          title: d.name || d.destinationId || 'Destino',
          reason: d.dashboardLabel || d.summary || `Interes en alza (${(d.country || '').trim() || 'región'})`,
          tags: asArray(d.tags).slice(0, 4),
          exploreHref: destinationExplorePath({
            loc: d.name || d.destinationId,
            country: d.country,
            destId: d.destinationId,
          }),
        }))

        const fromMicro = micro.map((m) => {
          const g = m.geo
          const loc = (g?.name || '').trim()
          const country = (g?.country || '').trim()
          const exploreHref =
            loc || country
              ? destinationExplorePath({
                  loc: loc || country,
                  country: loc ? country : undefined,
                  destId: g?.destinationId || m.trendId,
                })
              : null
          return {
            key: `micro-${m.trendId ?? m.title}`,
            title: m.title || 'Tendencia',
            reason: m.suggestedAction || 'Oportunidad detectada en el digest semanal',
            tags: asArray(m.affectedSegments).slice(0, 4),
            exploreHref,
          }
        })

        const merged = [...fromEmerging, ...fromMicro].slice(0, 6)
        setRecoCards(merged)
      } catch (e) {
        if (!cancelled) {
          setRecoError(e?.message || 'No se pudieron cargar tendencias desde el servicio de IA.')
          setRecoCards([])
        }
      } finally {
        if (!cancelled) setRecoLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setBuddies([])
      return
    }
    let cancelled = false
    ;(async () => {
      setBuddiesLoading(true)
      try {
        const res = await aiService.getBuddyRecommendations(String(user.id), null, 6)
        if (cancelled) return
        const recs = asArray(res?.recommendations)
        setBuddies(recs)
      } catch {
        if (!cancelled) setBuddies([])
      } finally {
        if (!cancelled) setBuddiesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <div className="home modern-home">
      <section className="hero-new">
        <div className="hero-copy">
          <p className="eyebrow">Inteligencia de viaje centrada en IA</p>
          <h1>
            Recomendaciones inteligentes.
            <br />
            Conexiones humanas reales.
          </h1>
          <p>
            SmarTrip entiende tus intereses y convierte contexto + comunidad en experiencias personalizadas en segundos.
          </p>
          <div className="hero-actions">
            <Link to="/ai-assistant">
              <Button variant="primary" size="large">
                Explorar recomendaciones
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/social">
              <Button variant="outline" size="large">
                Conectar con viajeros
              </Button>
            </Link>
          </div>
        </div>

        <div className="hero-previews">
          <Card className="preview-card" hover>
            <div className="preview-head">
              <Brain size={17} />
              <span>Feed inteligente</span>
            </div>
            <h3>“Plan 4 dias en Barcelona con arte + gastronomia”</h3>
            <div className="preview-tags">
              <span>Arte</span><span>Comida</span><span>Caminable</span>
            </div>
          </Card>

          <Card className="preview-card alt" hover>
            <div className="preview-head">
              <Users size={17} />
              <span>Match comunidad</span>
            </div>
            <h3>3 viajeros compatibles esta semana</h3>
            <p>Intereses compartidos y fechas cercanas.</p>
          </Card>
        </div>
      </section>

      <section className="section-block ai-section">
        <div className="section-heading">
          <p>Tendencias en vivo</p>
          <h2>Datos desde el motor de tendencias (IA)</h2>
        </div>
        {!user?.id && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <Link to="/login">Inicia sesion</Link> para cargar tendencias personalizadas desde IA.
          </p>
        )}
        {recoLoading && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Cargando destinos y microtendencias…
          </p>
        )}
        {recoError && !recoLoading && (
          <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{recoError}</p>
        )}
        {!recoLoading && recoCards.length === 0 && !recoError && (
          <p style={{ color: 'var(--text-secondary)' }}>
            Aun no hay senales emergentes. Los operadores pueden ingerir datos en{' '}
            <code>/trends/ingest/signals</code> del servicio de IA.
          </p>
        )}
        <div className="ai-grid">
          {recoCards.map((card) => (
            <Card key={card.key} hover className="ai-feed-card">
              <div className="ai-feed-top">
                <Sparkles size={16} />
                <span>Tendencia / recomendacion</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.reason}</p>
              {card.tags.length > 0 && (
                <div className="preview-tags">
                  {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              )}
              {card.exploreHref ? (
                <Link to={card.exploreHref} className="inline-action" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                  Ver catálogo y planes
                  <ArrowRight size={14} />
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section className="section-block community-section">
        <div className="section-heading">
          <p>Comunidad</p>
          <h2>Conecta con personas que viajan como tu</h2>
        </div>
        {!user?.id && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <Link to="/login">Inicia sesion</Link> para ver sugerencias reales de viajeros compatibles (API de matching).
          </p>
        )}
        {user?.id && buddiesLoading && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={18} className="animate-spin" /> Cargando sugerencias de la IA…
          </p>
        )}
        {user?.id && !buddiesLoading && buddies.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Aun no hay recomendaciones de compañeros. Completa tu perfil o visita{' '}
            <Link to="/social">Comunidad</Link>.
          </p>
        )}
        <div className="community-grid">
          {buddies.map((b) => {
            const name = b.name || 'Viajero'
            const score = typeof b.compatibilityScore === 'number' ? Math.round(b.compatibilityScore * 100) : null
            return (
              <Card key={String(b.userId ?? name)} className="profile-card" hover>
                <div className="profile-top">
                  <div className="profile-avatar">{name[0]}</div>
                  <div>
                    <h3>{name}</h3>
                    {score != null && <p>{score}% compatibilidad</p>}
                  </div>
                </div>
                <Link to="/social" className="inline-action" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MessageCircle size={14} /> Ir a comunidad
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="section-block trips-section">
        <div className="section-heading">
          <p>Experiencias</p>
          <h2>La compra y gestion de viajes, como complemento natural</h2>
        </div>
        <div className="trip-cards">
          <Card hover className="trip-card">
            <Compass size={20} />
            <h3>Diseña itinerarios</h3>
            <p>Planifica por bloques, intereses y presupuesto.</p>
          </Card>
          <Card hover className="trip-card">
            <Plane size={20} />
            <h3>Compara opciones</h3>
            <p>Integra vuelos/hoteles sin perder foco en la experiencia.</p>
          </Card>
          <Card hover className="trip-card">
            <Users size={20} />
            <h3>Coordina con otros</h3>
            <p>Comparte actividades y colabora en tiempo real.</p>
          </Card>
        </div>
      </section>

      <section className="section-block proof-section">
        <div className="section-heading">
          <p>Prueba social</p>
          <h2>Viajeros que deciden mejor con IA + comunidad</h2>
        </div>
        <div className="proof-grid">
          <Card className="quote-card" hover>
            <p>“En menos de 2 minutos tuve recomendaciones que si encajaban conmigo.”</p>
            <span>- Camila, Diseñadora de producto</span>
          </Card>
          <Card className="quote-card" hover>
            <p>“Lo mejor es conectar con gente compatible sin ruido de red social tradicional.”</p>
            <span>- Matteo, Consultor remoto</span>
          </Card>
          <Card className="quote-card" hover>
            <p>“Siento que la plataforma entiende mi estilo y no solo vende paquetes.”</p>
            <span>- Valentina, Viajera</span>
          </Card>
        </div>
      </section>

      <section className="section-block cta-final">
        <Card className="cta-panel">
          <h2>Empieza con recomendaciones inteligentes hoy</h2>
          <div className="hero-actions">
            <Link to="/register">
              <Button variant="primary" size="large">Crear cuenta</Button>
            </Link>
            <Link to="/ai-assistant">
              <Button variant="outline" size="large">Abrir asistente IA</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default Home
