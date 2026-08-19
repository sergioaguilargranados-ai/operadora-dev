import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import MapCanvas from '../../components/features/MapCanvas'

const { width, height } = Dimensions.get('window')

interface Place {
  id: string | number
  name: string
  category: string
  lat: number
  lng: number
  desc: string
  address?: string
}

export default function MobileMapScreen() {
  const router = useRouter()
  const searchParams = useLocalSearchParams<{ q?: string }>()

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('Monumentos')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingLoc, setLoadingLoc] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '')
  const [drawerExpanded, setDrawerExpanded] = useState(true)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = async () => {
    try {
      setLoadingLoc(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }
        setLocation(coords)
        loadMockPlaces(coords.latitude, coords.longitude)
      } else {
        const fallback = { latitude: 19.4326, longitude: -99.1332 }
        setLocation(fallback)
        loadMockPlaces(fallback.latitude, fallback.longitude)
      }
    } catch (e) {
      const fallback = { latitude: 19.4326, longitude: -99.1332 }
      setLocation(fallback)
      loadMockPlaces(fallback.latitude, fallback.longitude)
    } finally {
      setLoadingLoc(false)
    }
  }

  const loadMockPlaces = (lat: number, lng: number) => {
    const mockList: Place[] = [
      {
        id: '1',
        name: 'Monumento Principal / Zócalo',
        category: 'Monumentos',
        lat: lat + 0.004,
        lng: lng + 0.003,
        desc: 'Monumento histórico representativo de la ciudad.',
      },
      {
        id: '2',
        name: 'Palacio de Bellas Artes / Catedral',
        category: 'Monumentos',
        lat: lat - 0.003,
        lng: lng + 0.005,
        desc: 'Atracción turística de gran valor cultural y arquitectónico.',
      },
      {
        id: '3',
        name: 'Restaurante Tradicional',
        category: 'Restaurantes',
        lat: lat + 0.002,
        lng: lng - 0.004,
        desc: 'Cocina típica con ingredientes locales y terraza.',
      },
      {
        id: '4',
        name: 'Café & Bistro Histórico',
        category: 'Restaurantes',
        lat: lat - 0.004,
        lng: lng - 0.002,
        desc: 'Café artesanal y repostería típica de la región.',
      },
      {
        id: '5',
        name: 'Museo Nacional',
        category: 'Museos',
        lat: lat + 0.006,
        lng: lng - 0.005,
        desc: 'Exhibiciones de arte, historia y piezas arqueológicas.',
      },
      {
        id: '6',
        name: 'Hotel de tu Itinerario',
        category: 'Mi Hotel',
        lat: lat + 0.001,
        lng: lng + 0.001,
        desc: 'Tu alojamiento reservado para este viaje.',
      },
    ]
    setPlaces(mockList)
  }

  const categories = ['Monumentos', 'Restaurantes', 'Museos', 'Mi Hotel']

  const filteredPlaces = places.filter((p) => {
    const matchesCat = p.category === selectedCategory
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCat && matchesSearch
  })

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place)
  }

  const handleOpenExternalGPS = (place: Place) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)
  }

  return (
    <View style={styles.container}>
      {/* Floating Top Search Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.floatingBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugares, hoteles, museos..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={requestLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={20} color="#1D4ED8" />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Chips */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => {
                setSelectedCategory(cat)
                setSelectedPlace(null)
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Canvas (Universal Native & Web) */}
      {loadingLoc || !location ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="large" color="#1D4ED8" />
          <Text style={styles.mapLoadingText}>Cargando mapa interactivo...</Text>
        </View>
      ) : (
        <MapCanvas
          location={location}
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Bottom Drawer */}
      <View style={[styles.bottomDrawer, !drawerExpanded && { maxHeight: 60 }]}>
        <TouchableOpacity
          style={styles.drawerHandleRow}
          onPress={() => setDrawerExpanded(!drawerExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.drawerHandle} />
        </TouchableOpacity>

        {drawerExpanded && (
          <View style={{ flex: 1 }}>
            {selectedPlace ? (
              <View style={styles.selectedPlaceCard}>
                <View style={styles.selectedPlaceHeader}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={styles.placeCategoryBadge}>
                      <Text style={styles.placeCategoryText}>{selectedPlace.category}</Text>
                    </View>
                    <Text style={styles.selectedPlaceTitle}>{selectedPlace.name}</Text>
                    <Text style={styles.selectedPlaceDesc}>{selectedPlace.desc}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.navIconBtn}
                    onPress={() => handleOpenExternalGPS(selectedPlace)}
                  >
                    <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closePlaceBtn}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Text style={styles.closePlaceBtnText}>Cerrar selección</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerHeading}>Puntos de interés cercanos</Text>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.placesList}>
                  {filteredPlaces.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.placeItem}
                      onPress={() => handleSelectPlace(p)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.placeIconTile}>
                        <Ionicons
                          name={p.category === 'Mi Hotel' ? 'bed' : 'location'}
                          size={18}
                          color="#1D4ED8"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.placeItemTitle} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.placeItemDesc} numberOfLines={1}>
                          {p.desc}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                  {filteredPlaces.length === 0 && (
                    <Text style={styles.noPlacesText}>No se encontraron lugares en esta categoría.</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 13,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  categoriesWrapper: {
    position: 'absolute',
    top: 102,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mapLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: height * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHandleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  drawerHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  placesList: {
    gap: 8,
    paddingBottom: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
  placeIconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  placeItemDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  noPlacesText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 16,
  },
  selectedPlaceCard: {
    paddingVertical: 4,
  },
  selectedPlaceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  placeCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  placeCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  selectedPlaceTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  selectedPlaceDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  navIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePlaceBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  closePlaceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
})
