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
      <p>Redirecting to My Travels…</p>
    </div>
  )
}

export default TravelPlanning