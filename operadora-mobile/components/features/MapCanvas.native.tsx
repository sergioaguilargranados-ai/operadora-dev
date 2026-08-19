import React, { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

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
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  location,
  places,
  selectedPlace,
  onSelectPlace,
}) => {
  const mapRef = useRef<MapView | null>(null)

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {places.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          title={p.name}
          description={p.desc}
          pinColor={
            selectedPlace?.id === p.id
              ? '#10B981'
              : p.category === 'Mi Hotel'
              ? '#F59E0B'
              : '#1D4ED8'
          }
          onPress={() => onSelectPlace(p)}
        />
      ))}
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default MapCanvas
