import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Heart,
  Globe,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import './TravelDetails.css'

const TravelDetails = () => {
  const { id } = useParams()
  const [travel, setTravel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTravelDetails()
  }, [id])

  const fetchTravelDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/v1/travel-plans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Viaje no encontrado')
      }

      const data = await response.json()
      setTravel(data.data)
    } catch (error) {
      console.error('Error fetching travel details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por definir'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo'
      case 'PLANNING':
        return 'Planificando'
      case 'COMPLETED':
        return 'Completado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle size={16} className="text-green-600" />
      case 'PLANNING':
        return <Clock size={16} className="text-blue-600" />
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-gray-600" />
      case 'CANCELLED':
        return <AlertCircle size={16} className="text-red-600" />
      default:
        return <Info size={16} className="text-gray-600" />
    }
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este viaje? Esta acción no se puede deshacer.')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8080/api/v1/travel-plans/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al eliminar el viaje')
        }

        alert('Viaje eliminado exitosamente')
        navigate('/my-travels')
      } catch (error) {
        console.error('Error deleting travel:', error)
        alert('No se pudo eliminar el viaje')
      }
    }
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/travel-plans/${id}`
    if (navigator.share) {
      navigator.share({
        title: travel.title,
        text: travel.description,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del viaje...</p>
        </div>
      </div>
    )
  }

  if (error || !travel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mb-8">
              <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Viaje no encontrado
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'El viaje que buscas no existe o no tienes permiso para verlo.'}
              </p>
              <Link to="/my-travels">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Volver a Mis Viajes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="travel-details-header">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/my-travels" className="breadcrumb-link">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{travel.title}</h1>
                <p className="text-blue-100 mt-1">Detalles completos de tu viaje</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`status-badge ${getStatusColor(travel.status)}`}>
                {getStatusIcon(travel.status)}
                <span className="ml-1">{getStatusText(travel.status)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Información del viaje */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card className="detail-card p-6 fade-in">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Viaje</h2>
              
              <div className="space-y-4">
                <div className="info-item">
                  <div className="info-icon bg-blue-100">
                    <Globe size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Destino</p>
                    <p className="text-gray-600">{travel.destinationLocation || 'Destino por definir'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon bg-green-100">
                    <MapPin size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Origen</p>
                    <p className="text-gray-600">{travel.originLocation || 'Origen por definir'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon bg-purple-100">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Fechas del Viaje</p>
                    <p className="text-gray-600">
                      {formatDate(travel.startDate)} - {formatDate(travel.endDate)}
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon bg-orange-100">
                    <Users size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Número de Viajeros</p>
                    <p className="text-gray-600">{travel.numberOfTravelers || 1} {travel.numberOfTravelers === 1 ? 'persona' : 'personas'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon bg-green-100">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Presupuesto Estimado</p>
                    <p className="text-gray-600">
                      {travel.estimatedBudget ? `$${travel.estimatedBudget.toLocaleString()}` : 'No definido'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Descripción */}
            <Card className="detail-card p-6 fade-in">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-600 leading-relaxed">
                {travel.description || 'No hay descripción disponible para este viaje.'}
              </p>
            </Card>

            {/* Tipo de viaje */}
            <Card className="detail-card p-6 fade-in">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Viaje</h2>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {travel.travelType === 'LEISURE' ? 'Ocio' : 
                     travel.travelType === 'BUSINESS' ? 'Negocios' : 
                     travel.travelType === 'ADVENTURE' ? 'Aventura' : 
                     travel.travelType || 'No definido'}
                  </p>
                  <p className="text-sm text-gray-600">Categoría del viaje</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna lateral - Acciones y metadata */}
          <div className="space-y-6">
            {/* Acciones */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <Link to={`/travel-plans/${id}/edit`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center">
                    <Edit size={16} className="mr-2" />
                    Editar Viaje
                  </Button>
                </Link>
                
                <Button 
                  onClick={handleShare}
                  className="w-full bg-green-600 hover:bg-green-700 text-white inline-flex items-center justify-center"
                >
                  <Share2 size={16} className="mr-2" />
                  Compartir Viaje
                </Button>
                
                <Button 
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Eliminar Viaje
                </Button>
              </div>
            </Card>

            {/* Información adicional */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Visibilidad</span>
                  <span className="text-sm font-medium">
                    {travel.isPublic ? 'Público' : 'Privado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creado</span>
                  <span className="text-sm font-medium">{formatDate(travel.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Actualizado</span>
                  <span className="text-sm font-medium">{formatDate(travel.updatedAt)}</span>
                </div>
              </div>
            </Card>

            {/* Enlaces rápidos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
              <div className="space-y-2">
                <Link to="/my-travels" className="block text-blue-600 hover:text-blue-800 text-sm">
                  ← Volver a Mis Viajes
                </Link>
                <Link to="/travel-plans/create" className="block text-blue-600 hover:text-blue-800 text-sm">
                  + Crear Nuevo Viaje
                </Link>
                <Link to="/social" className="block text-blue-600 hover:text-blue-800 text-sm">
                  👥 Buscar Viajeros
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TravelDetails
