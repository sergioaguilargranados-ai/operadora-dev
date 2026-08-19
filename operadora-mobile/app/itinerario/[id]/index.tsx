import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '../../../store/auth.store'
import MobileLogo from '../../../components/features/MobileLogo'
import NotificationBell from '../../../components/features/NotificationBell'
import WeatherWidget from '../../../components/features/WeatherWidget'
import FoodDetailModal from '../../../components/features/FoodDetailModal'
import PlaceDetailModal from '../../../components/features/PlaceDetailModal'
import ItineraryService, { ItineraryData } from '../../../services/itinerary.service'
import api from '../../../services/api'

const { width } = Dimensions.get('window')

export default function MobileItineraryDetailPage() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [activeTab, setActiveTab] = useState<'resumen' | 'itinerario' | 'documentos'>('itinerario')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Modales
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      loadItineraryData(params.id)
    }
  }, [params.id])

  const loadItineraryData = async (tourId: string) => {
    try {
      setLoading(true)
      const data = await ItineraryService.getItinerary(tourId)
      if (data) {
        setItinerary(data)
      }
    } catch (e) {
      console.warn('Error loading itinerary', e)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!itinerary) return
    try {
      const currentDay = itinerary.days?.[selectedDayIndex]
      const text = `¡Mira mi itinerario con AS Operadora para ${itinerary.title}!\n${
        currentDay ? `Día ${currentDay.day}: ${currentDay.title}\n${currentDay.description || ''}` : ''
      }\nDescubre más en https://www.as-ope-viajes.company`
      await Share.share({
        message: text,
        title: itinerary.title,
      })
    } catch (error) {
      console.warn('Error sharing', error)
    }
  }

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked)
    if (!user?.id || !itinerary) return

    try {
      if (!isBookmarked) {
        await api.post('/wishlist', {
          user_id: user.id,
          item_name: itinerary.title,
          item_desc: itinerary.description || 'Itinerario de viaje',
          item_img: itinerary.hero_image,
          city: itinerary.destination,
          category: 'place',
        })
        Alert.alert('Guardado', 'Itinerario agregado a tu Wishlist')
      }
    } catch (e) {
      console.warn('Error saving to wishlist', e)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Cargando tu itinerario...</Text>
      </View>
    )
  }

  if (!itinerary) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={54} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No se encontró el itinerario</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver a mis viajes</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const days = itinerary.days || []
  const currentDay = days[selectedDayIndex] || days[0]

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Image Banner */}
        <ImageBackground
          source={{
            uri:
              itinerary.hero_image ||
              'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.heroBanner}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <MobileLogo variant="light" size="sm" />

            <View style={styles.topRightIcons}>
              <TouchableOpacity onPress={handleBookmark} style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isBookmarked ? '#F59E0B' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <NotificationBell isWhite size={22} />
            </View>
          </View>

          {/* Hero Details */}
          <View style={styles.heroDetails}>
            <View style={styles.destRow}>
              <Ionicons name="location-sharp" size={14} color="#FBBF24" />
              <Text style={styles.destText}>{itinerary.destination || 'Destino de ensueño'}</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {itinerary.title}
            </Text>
            <Text style={styles.daysCountText}>{days.length} días de experiencia inolvidable</Text>
          </View>
        </ImageBackground>

        {/* 3 Main Tabs: Resumen | Itinerario | Documentos */}
        <View style={styles.mainTabs}>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeTab === 'itinerario' && styles.mainTabBtnActive]}
            onPress={() => setActiveTab('itinerario')}
          >
            <Text style={[styles.mainTabText, activeTab === 'itinerario' && styles.mainTabTextActive]}>
              Itinerario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeTab === 'resumen' && styles.mainTabBtnActive]}
            onPress={() => setActiveTab('resumen')}
          >
            <Text style={[styles.mainTabText, activeTab === 'resumen' && styles.mainTabTextActive]}>
              Resumen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeTab === 'documentos' && styles.mainTabBtnActive]}
            onPress={() => setActiveTab('documentos')}
          >
            <Text style={[styles.mainTabText, activeTab === 'documentos' && styles.mainTabTextActive]}>
              Documentos
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ITINERARIO DÍA POR DÍA */}
        {activeTab === 'itinerario' && (
          <View style={styles.tabContent}>
            {/* Days Horizontal Carousel */}
            {days.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysScroll}
              >
                {days.map((dayItem, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dayChip, selectedDayIndex === idx && styles.dayChipActive]}
                    onPress={() => setSelectedDayIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.dayChipNumber, selectedDayIndex === idx && styles.dayChipTextActive]}
                    >
                      Día {dayItem.day || idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Current Day Details */}
            {currentDay && (
              <View style={styles.dayDetailsContainer}>
                {/* Weather Forecast Widget */}
                <WeatherWidget city={itinerary.destination} />

                {/* Day Header */}
                <View style={styles.dayCard}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>DÍA {currentDay.day || selectedDayIndex + 1}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{currentDay.title}</Text>
                  <Text style={styles.dayDesc}>{currentDay.description || currentDay.desc}</Text>
                </View>

                {/* Gastronomía */}
                {currentDay.gastronomy && currentDay.gastronomy.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <Ionicons name="restaurant-outline" size={18} color="#111827" />
                      <Text style={styles.sectionHeading}>Gastronomía imperdible</Text>
                    </View>
                    <View style={styles.cardsGrid}>
                      {currentDay.gastronomy.map((food, fIdx) => (
                        <TouchableOpacity
                          key={fIdx}
                          style={styles.mediaCard}
                          onPress={() => setSelectedFood(food)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{
                              uri:
                                food.image ||
                                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                            }}
                            style={styles.mediaCardImage}
                          />
                          <View style={styles.mediaCardText}>
                            <Text style={styles.mediaCardTitle} numberOfLines={1}>
                              {food.name}
                            </Text>
                            <Text style={styles.mediaCardSub} numberOfLines={1}>
                              Toca para ver receta y detalles
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Lugares de Interés */}
                {currentDay.places && currentDay.places.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <Ionicons name="map-outline" size={18} color="#111827" />
                      <Text style={styles.sectionHeading}>Lugares de interés</Text>
                    </View>
                    <View style={styles.cardsGrid}>
                      {currentDay.places.map((place, pIdx) => (
                        <TouchableOpacity
                          key={pIdx}
                          style={styles.mediaCard}
                          onPress={() => setSelectedPlace(place)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{
                              uri:
                                place.image ||
                                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80',
                            }}
                            style={styles.mediaCardImage}
                          />
                          <View style={styles.mediaCardText}>
                            <Text style={styles.mediaCardTitle} numberOfLines={1}>
                              {place.name}
                            </Text>
                            <Text style={styles.mediaCardSub} numberOfLines={1}>
                              Ver fotos y ubicación
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Botones de Acción: Ver Mapa & Compartir */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.mapActionBtn}
                    onPress={() =>
                      router.push(
                        `/(tabs)/mapa?q=${encodeURIComponent(
                          `${itinerary.destination} ${currentDay.title}`
                        )}` as any
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="map" size={18} color="#FFFFFF" />
                    <Text style={styles.mapActionBtnText}>Ver en Mapa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareActionBtn}
                    onPress={handleShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-social-outline" size={18} color="#111827" />
                    <Text style={styles.shareActionBtnText}>Compartir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: RESUMEN */}
        {activeTab === 'resumen' && (
          <View style={styles.tabContent}>
            <View style={styles.dayCard}>
              <Text style={styles.sectionHeading}>Descripción general del viaje</Text>
              <Text style={styles.dayDesc}>{itinerary.description || 'Sin descripción detallada.'}</Text>
            </View>

            <View style={styles.dayCard}>
              <Text style={styles.sectionHeading}>Servicios incluidos</Text>
              <View style={styles.serviceItem}>
                <Ionicons name="airplane-outline" size={18} color="#1D4ED8" />
                <Text style={styles.serviceText}>Vuelos redondos y traslados aeropuerto-hotel</Text>
              </View>
              <View style={styles.serviceItem}>
                <Ionicons name="bed-outline" size={18} color="#1D4ED8" />
                <Text style={styles.serviceText}>Hospedaje en hoteles de categoría seleccionada</Text>
              </View>
              <View style={styles.serviceItem}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
                <Text style={styles.serviceText}>Seguro de viajero y asistencia 24/7</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <View style={styles.tabContent}>
            <View style={styles.dayCard}>
              <Text style={styles.sectionHeading}>Vouchers y Documentación</Text>
              <Text style={styles.dayDesc}>
                Aquí puedes consultar tus pases de abordar, pólizas de seguro y vouchers de hotel.
              </Text>
              <TouchableOpacity
                style={styles.docRow}
                onPress={() => router.push('/perfil/documentos' as any)}
              >
                <View style={styles.docIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#1D4ED8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>Mis Documentos de Perfil</Text>
                  <Text style={styles.docSub}>Pasaportes, visas y archivos subidos</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modales de detalle */}
      <FoodDetailModal isOpen={!!selectedFood} onClose={() => setSelectedFood(null)} food={selectedFood} />
      <PlaceDetailModal isOpen={!!selectedPlace} onClose={() => setSelectedPlace(null)} place={selectedPlace} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroBanner: {
    height: 280,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    zIndex: 10,
  },
  iconBtn: {
    padding: 6,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroDetails: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    zIndex: 10,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  destText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 4,
  },
  daysCountText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  mainTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  mainTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  mainTabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  daysScroll: {
    paddingVertical: 6,
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  dayChipActive: {
    backgroundColor: '#000000',
  },
  dayChipNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  dayDetailsContainer: {
    marginTop: 8,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  dayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  dayDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mediaCardImage: {
    width: '100%',
    height: 100,
  },
  mediaCardText: {
    padding: 10,
  },
  mediaCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  mediaCardSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  mapActionBtn: {
    flex: 1,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  mapActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shareActionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareActionBtnText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  serviceText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  docSub: {
    fontSize: 11,
    color: '#6B7280',
  },
})
