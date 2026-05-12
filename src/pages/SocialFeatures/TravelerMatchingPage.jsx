import { useState } from 'react'
import TravelerMatching from '../../components/TravelerMatching/TravelerMatching'
import './SocialFeatures.css'

/**
 * Page for Traveler Matching functionality
 * 
 * This page demonstrates Task 1: Search travelers by destination and similar dates
 * and Task 2: Send connection requests
 */
const TravelerMatchingPage = () => {
  const [travelPlanId, setTravelPlanId] = useState('')

  return (
    <div className="social-features-page">
      <div className="page-header">
        <h1>Encuentra viajeros compatibles</h1>
        <p>Conecta con viajeros que tengan destinos y fechas similares</p>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="tm-plan-id">ID del plan de viaje</label>
          <input
            id="tm-plan-id"
            type="text"
            value={travelPlanId}
            onChange={(e) => setTravelPlanId(e.target.value)}
            placeholder="Ingresa el ID de tu plan"
          />
        </div>
        <TravelerMatching travelPlanId={travelPlanId || undefined} />
      </div>

      <div className="page-info">
        <div className="info-card">
          <h3>Como funciona</h3>
          <ol>
            <li>Selecciona uno de tus planes de viaje activos</li>
            <li>Nuestro sistema encuentra viajeros con el mismo destino</li>
            <li>Revisa la compatibilidad segun fechas superpuestas</li>
            <li>{'Envía solicitudes de conexion a viajeros que te gustaria conocer'}</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>Funciones</h3>
          <ul>
            <li>✅ Matching inteligente por destino y fechas</li>
            <li>✅ Sistema de puntuacion de compatibilidad</li>
            <li>✅ Perfiles de viajeros detallados</li>
            <li>✅ Solicitudes de conexion seguras</li>
            <li>✅ Prevencion de solicitudes duplicadas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TravelerMatchingPage
