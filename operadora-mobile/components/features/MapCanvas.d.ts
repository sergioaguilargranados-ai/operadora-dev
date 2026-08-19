import React from 'react'

export interface Place {
  id: string | number
  name: string
  category: string
  lat: number
  lng: number
  desc: string
  address?: string
}

export interface MapCanvasProps {
  location: { latitude: number; longitude: number }
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place) => void
  searchQuery?: string
  selectedCategory?: string
}

declare const MapCanvas: React.FC<MapCanvasProps>
export default MapCanvas
