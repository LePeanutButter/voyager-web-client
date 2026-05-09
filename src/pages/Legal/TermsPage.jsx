import Card from '../../components/UI/Card'
import './LegalPages.css'

const TermsPage = () => {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <span className="legal-kicker">Legal</span>
        <h1 className="legal-title">Terminos de Servicio</h1>
        <p className="legal-meta">Ultima actualizacion: 07 mayo 2026</p>
      </header>

      <Card className="legal-card">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Aceptacion de terminos</h2>
            <p>
              Al usar SmarTrip aceptas estos terminos y te comprometes a utilizar la plataforma de forma legal, responsable y
              respetuosa con otros usuarios.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Uso permitido</h2>
            <ul>
              <li>No publicar contenido fraudulento, ofensivo o ilegal.</li>
              <li>No intentar acceder sin autorizacion a cuentas o sistemas.</li>
              <li>No usar automatizaciones que degraden el servicio.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Cuentas y seguridad</h2>
            <p>
              Eres responsable de la confidencialidad de tus credenciales y de toda actividad realizada en tu cuenta. Debes notificarnos
              de inmediato ante cualquier uso no autorizado.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Contenido y propiedad intelectual</h2>
            <p>
              SmarTrip y sus elementos de software, marca y diseno estan protegidos por derechos de propiedad intelectual.
              Conservas la titularidad de tu contenido, pero otorgas permisos necesarios para operarlo dentro del servicio.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Limitacion de responsabilidad</h2>
            <p>
              SmarTrip se ofrece tal cual, sin garantias expresas adicionales. En la medida permitida por la ley, no garantizamos
              disponibilidad continua ni ausencia total de errores y no asumimos responsabilidad por danos indirectos derivados del
              uso del servicio.
            </p>
          </section>

          <section className="legal-section legal-note">
            <p>
              Podemos actualizar estos terminos para reflejar cambios legales o de producto. El uso continuado de la plataforma
              implica aceptacion de las versiones vigentes.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}

export default TermsPage
