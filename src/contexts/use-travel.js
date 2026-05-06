import { useContext } from 'react'
import { TravelContext } from './travel-context.js'

export function useTravel() {
  const context = useContext(TravelContext)
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider')
  }
  return context
}
