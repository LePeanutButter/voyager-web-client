import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TravelPlanning = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/my-travels', { replace: true })
  }, [navigate])

  return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Redirigiendo a Mis Viajes…</p>
    </div>
  )
}

export default TravelPlanning