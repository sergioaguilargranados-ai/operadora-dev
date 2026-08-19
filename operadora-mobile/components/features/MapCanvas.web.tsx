import React from 'react'
import { StyleSheet, View } from 'react-native'

interface Place {
  id: string | number
  name: string
  category: string
  lat: number
  lng: number
  desc: string
}

interface MapCanvasProps {
  location: { latitude: number; longitude: number }
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place) => void
  searchQuery?: string
  selectedCategory?: string
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  selectedPlace,
  searchQuery,
  selectedCategory,
}) => {
  const query = selectedPlace
    ? `${selectedPlace.name} ${selectedPlace.desc}`
    : searchQuery || selectedCategory || 'Ciudad de México'

  return (
    <View style={styles.container}>
      <iframe
        title="Google Maps Web"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default MapCanvas
