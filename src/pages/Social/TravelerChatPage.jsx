import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Card from '../../components/UI/Card'
import TravelerChat from '../../components/TravelerChat/TravelerChat'
import { useAuth } from '../../hooks/useAuth'

const TravelerChatPage = () => {
  const { connectionId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const peerName = searchParams.get('name') || 'Viajero'
  const cid = connectionId != null ? Number(connectionId) : null

  return (
    <div className="social-page">
      <Card title="Chat" subtitle="Coordina con tu conexión sin salir de SmartTrip">
        <TravelerChat connectionId={cid} userId={user?.id ?? null} peerName={peerName} />
      </Card>
    </div>
  )
}

export default TravelerChatPage
