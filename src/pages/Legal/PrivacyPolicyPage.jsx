import Card from '../../components/UI/Card'
import './LegalPages.css'

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <span className="legal-kicker">Legal</span>
        <h1 className="legal-title">Politica de Privacidad</h1>
        <p className="legal-meta">Ultima actualizacion: 07 mayo 2026</p>
      </header>

      <Card className="legal-card">
        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Informacion que recopilamos</h2>
            <p>
              En SmarTrip recopilamos informacion necesaria para ofrecer recomendaciones personalizadas, funcionalidades de comunidad
              y gestion de experiencias. Esto puede incluir datos de cuenta, preferencias de viaje, interacciones en la plataforma
              y metadatos tecnicos de uso.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Como usamos tu informacion</h2>
            <ul>
              <li>Personalizar recomendaciones impulsadas por IA.</li>
              <li>Conectar usuarios con intereses compatibles.</li>
              <li>Mejorar la calidad, seguridad y rendimiento del servicio.</li>
              <li>Cumplir obligaciones legales y prevenir abuso de la plataforma.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Comparticion de datos</h2>
            <p>
              No vendemos tus datos personales. Podemos compartir informacion con proveedores de infraestructura, analitica y seguridad
              que actuan como encargados de tratamiento, bajo acuerdos de confidencialidad y uso limitado.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Conservacion y seguridad</h2>
            <p>
              Conservamos la informacion solo durante el tiempo necesario para prestar el servicio y cumplir requisitos legales.
              Aplicamos medidas tecnicas y organizativas razonables para proteger la confidencialidad e integridad de los datos.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Tus derechos</h2>
            <p>
              Puedes solicitar acceso, rectificacion, actualizacion o eliminacion de tus datos personales, asi como limitar ciertos
              tratamientos cuando corresponda por normativa aplicable.
            </p>
          </section>

          <section className="legal-section legal-note">
            <p>
              Para solicitudes de privacidad o dudas sobre esta politica, utiliza los canales oficiales habilitados dentro de tu cuenta.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}

export default PrivacyPolicyPage
