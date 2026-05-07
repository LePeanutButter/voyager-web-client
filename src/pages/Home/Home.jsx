import { Link } from 'react-router-dom'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import { Brain, Users, Sparkles, ArrowRight, Compass, MessageCircle, Plane } from 'lucide-react'
import './Home.css'

const Home = () => {
  const aiCards = [
    { title: 'Weekend creativo en CDMX', tags: ['Comida', 'Arte', 'Noche'], reason: 'Basado en tus gustos urbanos y presupuesto' },
    { title: 'Ruta slow en Lisboa', tags: ['Cultura', 'Cafe', 'Caminatas'], reason: 'Afinado por tu historial de viajes tranquilos' },
    { title: 'Escapada social en Medellin', tags: ['Personas', 'Eventos locales'], reason: 'Alta compatibilidad con viajeros similares' },
  ]

  const connections = [
    { name: 'Sofia P.', city: 'Buenos Aires', interests: ['Comida callejera', 'Musica en vivo'] },
    { name: 'Luca M.', city: 'Milan', interests: ['Diseno', 'Rutas de cafe'] },
    { name: 'Daniela R.', city: 'Bogota', interests: ['Museos', 'Senderismo'] },
  ]

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
          <p>Recomendaciones IA</p>
          <h2>Tu feed personalizado de experiencias</h2>
        </div>
        <div className="ai-grid">
          {aiCards.map((card) => (
            <Card key={card.title} hover className="ai-feed-card">
              <div className="ai-feed-top">
                <Sparkles size={16} />
                <span>Recomendacion IA</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.reason}</p>
              <div className="preview-tags">
                {card.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-block community-section">
        <div className="section-heading">
          <p>Comunidad</p>
          <h2>Conecta con personas que viajan como tu</h2>
        </div>
        <div className="community-grid">
          {connections.map((person) => (
            <Card key={person.name} className="profile-card" hover>
              <div className="profile-top">
                <div className="profile-avatar">{person.name[0]}</div>
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.city}</p>
                </div>
              </div>
              <div className="preview-tags">
                {person.interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
              <button type="button" className="inline-action">
                <MessageCircle size={14} /> Ver compatibilidad
              </button>
            </Card>
          ))}
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
