const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockLoadTrips = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          destination: 'Paris, France',
          startDate: '2024-06-15',
          endDate: '2024-06-22',
          status: 'planning',
          budget: 2000,
          travelers: 2,
        },
        {
          id: 2,
          destination: 'Tokyo, Japan',
          startDate: '2024-08-10',
          endDate: '2024-08-20',
          status: 'confirmed',
          budget: 3500,
          travelers: 2,
        },
      ])
    }, 500)
  })
}

export const mockAddTrip = async (tripData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        ...tripData,
        status: 'planning',
      })
    }, 500)
  })
}

export const mockUpdateTrip = async (tripId, tripData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: tripId,
        ...tripData,
      })
    }, 500)
  })
}

export const mockDeleteTrip = async (tripId) => {
  await delay(500)
  return { deletedId: tripId }
}

export const mockLoadDestinations = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Paris, France', country: 'France', type: 'city', rating: 4.8 },
        { id: 2, name: 'Bali, Indonesia', country: 'Indonesia', type: 'island', rating: 4.9 },
        { id: 3, name: 'Tokyo, Japan', country: 'Japan', type: 'city', rating: 4.7 },
      ])
    }, 500)
  })
}

export const mockAddFavorite = async (destination) => {
  await delay(300)
  return { added: destination?.id ?? true }
}

export const mockRemoveFavorite = async (destinationId) => {
  await delay(300)
  return { removedId: destinationId }
}

export const mockLoadRecommendations = async (preferences) => {
  const preferenceBoost =
    preferences && typeof preferences === 'object' ? 0.02 : 0
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'Santorini, Greece',
          reason: 'Perfect for romantic getaways',
          score: 0.95 + preferenceBoost,
        },
        {
          id: 2,
          name: 'Swiss Alps, Switzerland',
          reason: 'Great for adventure activities',
          score: 0.88 + preferenceBoost,
        },
      ])
    }, 800)
  })
}
