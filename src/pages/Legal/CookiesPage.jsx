import Card from '../../components/UI/Card'
import './LegalPages.css'

const CookiesPage = () => {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <span className="legal-kicker">Legal</span>
        <h1 className="legal-title">Politica de Cookies</h1>
        <p className="legal-meta">Ultima actualizacion: 07 mayo 2026</p>
      </header>

      <Card className="legal-card">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Que son las cookies</h2>
            <p>
              Las cookies son pequenos archivos que se almacenan en tu navegador para recordar preferencias, mejorar rendimiento
              y medir el uso de SmarTrip.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Tipos de cookies que usamos</h2>
            <ul>
              <li><strong>Esenciales:</strong> necesarias para autenticacion y funcionamiento basico.</li>
              <li><strong>Funcionales:</strong> recuerdan configuraciones y preferencias de experiencia.</li>
              <li><strong>Analiticas:</strong> ayudan a entender uso y mejorar producto.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Gestion de cookies</h2>
            <p>
              Puedes configurar tu navegador para bloquear o eliminar cookies. Algunas funciones del sitio pueden no funcionar
              correctamente si desactivas cookies esenciales.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Cookies de terceros</h2>
            <p>
              Determinadas integraciones de terceros (por ejemplo analitica o autenticacion externa) pueden establecer sus propias
              cookies conforme a sus politicas de privacidad.
            </p>
          </section>

          <section className="legal-section legal-note">
            <p>
              El uso continuado de la plataforma implica aceptacion del uso de cookies segun esta politica y la normativa aplicable.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}

export default CookiesPage
