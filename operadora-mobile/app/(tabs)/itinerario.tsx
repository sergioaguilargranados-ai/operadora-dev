import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import MobileLogo from '../../components/features/MobileLogo'
import api from '../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function MobileTripsListPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [upcomingTours, setUpcomingTours] = useState<any[]>([])
  const [pastTours, setPastTours] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (user?.id) {
      fetchTours()
    }
  }, [user?.id])

  const fetchTours = async () => {
    try {
      setLoading(true)
      // 1. Try local cache first for instant load
      const cached = await AsyncStorage.getItem(`cached_tours_${user?.id}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        setUpcomingTours(parsed.upcoming || [])
        setPastTours(parsed.past || [])
      }

      // 2. Fetch fresh data from backend
      const res = await api.get(`/bookings?userId=${user?.id}`)
      if (res.data?.success && Array.isArray(res.data.data)) {
        const bookingsList = res.data.data
        const userToursMap = new Map()

        bookingsList.forEach((b: any) => {
          try {
            const details =
              typeof b.special_requests === 'string'
                ? JSON.parse(b.special_requests)
                : b.special_requests || {}
            const tripName = b.service_name || details.tour_name || details.destination || 'Viaje'
            const tripId = details.tour_id || b.id.toString()

            if (!userToursMap.has(tripId)) {
              const hasExplicitDate = Boolean(b.travel_date || details.fecha_inicio)
              const tripDate = hasExplicitDate
                ? new Date(b.travel_date || details.fecha_inicio)
                : new Date(b.created_at)
              const now = new Date()
              const isPast = b.status === 'completed' || (hasExplicitDate && tripDate < now)

              userToursMap.set(tripId, {
                tour_id: tripId,
                booking_id: b.id,
                name: tripName,
                dateStr: hasExplicitDate
                  ? tripDate.toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Próximamente',
                pax: b.pax || details.pax || details.pasajeros || b.adults || 2,
                isPast,
                image:
                  details.image_url ||
                  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
              })
            }
          } catch (e) {}
        })

        const allTours = Array.from(userToursMap.values())
        const upcoming = allTours.filter((t) => !t.isPast)
        const past = allTours.filter((t) => t.isPast)

        setUpcomingTours(upcoming)
        setPastTours(past)

        await AsyncStorage.setItem(
          `cached_tours_${user?.id}`,
          JSON.stringify({ upcoming, past })
        )
      }
    } catch (error) {
      console.warn('Error fetching tours', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const currentList = activeTab === 'upcoming' ? upcomingTours : pastTours

  return (
    <View style={styles.container}>
      {/* Header Fijo */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTours(); }} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Mis viajes</Text>
          <Text style={styles.pageSubtitle}>
            Consulta y organiza todos los viajes que tienes planeados en un solo lugar.
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Próximos ({upcomingTours.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
            onPress={() => setActiveTab('past')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              Pasados ({pastTours.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Viajes */}
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#1D4ED8" />
            <Text style={styles.loaderText}>Cargando tus viajes...</Text>
          </View>
        ) : currentList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              No tienes viajes {activeTab === 'upcoming' ? 'próximos' : 'pasados'}.
            </Text>
            <Text style={styles.emptySubtitle}>
              Cuando tengas reservaciones confirmadas, aparecerán listadas aquí.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {currentList.map((tour, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() => router.push(`/itinerario/${tour.tour_id}` as any)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: tour.image }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.tourName} numberOfLines={2}>
                      {tour.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{tour.dateStr}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="people-outline" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{tour.pax} personas</Text>
                  </View>

                  <View style={styles.badgeContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        tour.isPast ? styles.badgePast : styles.badgeUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          tour.isPast ? styles.statusPastText : styles.statusUpcomingText,
                        ]}
                      >
                        {tour.isPast ? 'Viaje completado' : 'Próximo viaje'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyState: {
    marginHorizontal: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  cardImage: {
    width: 96,
    height: 120,
    borderRadius: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tourName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    paddingRight: 6,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#4B5563',
  },
  badgeContainer: {
    marginTop: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeUpcoming: {
    backgroundColor: '#DCFCE7',
  },
  badgePast: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusUpcomingText: {
    color: '#15803D',
  },
  statusPastText: {
    color: '#6B7280',
  },
})
