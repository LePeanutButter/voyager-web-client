import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../contexts/AuthContext'
import { MapPin, Calendar, Users, DollarSign, Clock, Plus, Luggage } from 'lucide-react'

const MyTravels = () => {
  const [travels, setTravels] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchMyTravels()
  }, [])

  const fetchMyTravels = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/v1/travel-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar los viajes')
      }

      const data = await response.json()
      setTravels(data.data || [])
    } catch (error) {
      console.error('Error fetching travels:', error)
      alert('No se pudieron cargar tus viajes')
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
        return 'bg-green-100 text-green-800'
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus viajes...</p>
        </div>
      </div>
    )
  }

  if (travels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Luggage size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Aún no tienes viajes creados?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Comienza planificando tu primera aventura y conecta con otros viajeros que comparten tus mismos intereses
              </p>
              <Link to="/travel-plans/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg inline-flex items-center">
                  <Plus size={20} className="mr-2" />
                  Crear mi primer viaje
                </Button>
              </Link>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Viajes</h1>
          <p className="text-gray-600">
            Administra y gestiona todos tus viajes creados
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Luggage size={20} className="text-blue-600" />
            <span className="text-sm text-gray-500 font-medium">
              {travels.length} {travels.length === 1 ? 'viaje encontrado' : 'viajes encontrados'}
            </span>
          </div>
          <Link to="/travel-plans/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white inline-flex items-center">
              <Plus size={16} className="mr-2" />
              Nuevo Viaje
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {travels.map((travel) => (
            <Card key={travel.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <div className="relative">
                {/* Header con imagen de fondo */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(travel.status)}`}>
                      {getStatusText(travel.status)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold line-clamp-1">
                      {travel.title}
                    </h3>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {travel.description || 'Sin descripción disponible'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{travel.destinationLocation || 'Destino por definir'}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar size={16} className="mr-2 text-green-500 flex-shrink-0" />
                      <span className="text-xs">
                        {formatDate(travel.startDate)} - {formatDate(travel.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {travel.numberOfTravelers && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Users size={16} className="mr-2 text-purple-500 flex-shrink-0" />
                          <span className="text-xs">{travel.numberOfTravelers} {travel.numberOfTravelers === 1 ? 'viajero' : 'viajeros'}</span>
                        </div>
                      )}
                      
                      {travel.estimatedBudget && (
                        <div className="flex items-center text-sm text-gray-700">
                          <DollarSign size={16} className="mr-1 text-green-600 flex-shrink-0" />
                          <span className="text-xs font-semibold">${travel.estimatedBudget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <Link to={`/travel-plans/${travel.id}`}>
                        <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 h-auto">
                          Ver detalles
                        </Button>
                      </Link>
                      <div className="text-xs text-gray-400 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatDate(travel.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyTravels
