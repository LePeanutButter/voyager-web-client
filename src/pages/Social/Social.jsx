import React from 'react'
import Card from '../../components/UI/Card'
import ActiveConnections from '../../components/ActiveConnections/ActiveConnections'
import { useAuth } from '../../hooks/useAuth'

const Social = () => {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return (
    <div className="social-page">
      <h1>Comunidad</h1>
      <Card title="Tus relaciones en la plataforma">
        <ActiveConnections userId={userId} />
      </Card>
    </div>
  )
}

export default Social
