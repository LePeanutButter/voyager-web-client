import ConnectionRequests from '../../components/ConnectionRequests/ConnectionRequests'
import './SocialFeatures.css'

/**
 * Page for Connection Requests management
 * 
 * This page demonstrates Task 3: Accept or reject connection requests
 */
const ConnectionRequestsPage = () => {
  return (
    <div className="social-features-page">
      <div className="page-header">
        <h1>Solicitudes de conexion</h1>
        <p>Gestiona solicitudes de viajeros que quieren conectar contigo</p>
      </div>

      <div className="page-content">
        <ConnectionRequests />
      </div>

      <div className="page-info">
        <div className="info-card">
          <h3>Gestion de solicitudes</h3>
          <p>Cuando los viajeros te envian solicitudes de conexion, puedes:</p>
          <ul>
            <li><strong>Aceptar:</strong> crea una conexion y permite que se escriban entre ustedes</li>
            <li><strong>Rechazar:</strong> declina la solicitud y la quita de pendientes</li>
            <li><strong>Ignorar:</strong> las solicitudes quedan pendientes hasta que tomes accion</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Consejos de seguridad</h3>
          <ul>
            <li>✅ Revisa perfiles antes de aceptar solicitudes</li>
            <li>✅ Verifica compatibilidad en los planes de viaje</li>
            <li>✅ Empieza con mensajes publicos antes de compartir datos personales</li>
            <li>✅ Reporta cualquier comportamiento sospechoso</li>
            <li>✅ Confia en tu intuicion y prioriza tu seguridad</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Beneficios</h3>
          <ul>
            <li>🌍 Conoce viajeros con intereses similares</li>
            <li>🤝 Encuentra companeros para tus viajes</li>
            <li>💬 Comparte consejos y experiencias</li>
            <li>🗺️ Planifica actividades en conjunto</li>
            <li>📱 Mantente conectado durante tus viajes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConnectionRequestsPage
