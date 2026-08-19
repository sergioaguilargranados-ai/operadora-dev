import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import MobileLogo from '../components/features/MobileLogo'

export default function MobileSuggestedActivitiesScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const suggestedActivities = [
    {
      id: '1',
      title: 'Tour por el Palacio Real',
      rating: 4.9,
      reviews: 128,
      duration: '2 h 30 min',
      price: 'Desde $38 USD',
      location: 'A 12 minutos de tu hotel',
      image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '2',
      title: 'Clase de Paella Tradicional',
      rating: 4.9,
      reviews: 96,
      duration: '3 horas',
      price: 'Incluye degustación',
      location: 'Centro histórico',
      image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '3',
      title: 'Museo del Prado sin filas',
      rating: 4.8,
      reviews: 210,
      duration: 'Entrada incluida',
      price: 'Flexible',
      location: 'Paseo del Prado',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=80',
    },
  ]

  const filtered = suggestedActivities.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <MobileLogo variant="dark" size="md" />
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>¿No sabes qué actividad hacer?</Text>
          <Text style={styles.pageSubtitle}>
            Te recomendamos experiencias según tu destino, fechas de viaje y tus gustos personales.
          </Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar actividades o atracciones..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Banner "Ideal para hoy" */}
        <View style={styles.todayBanner}>
          <View style={styles.sunCircle}>
            <Ionicons name="sunny" size={22} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.todayBadge}>IDEAL PARA HOY</Text>
            <Text style={styles.todayTitle}>Parque del Retiro & Bote</Text>
            <Text style={styles.todayDesc}>
              Con el clima soleado actual es un momento perfecto para pasear en bote o caminar por los jardines.
            </Text>
            <View style={styles.todayMetaRow}>
              <Text style={styles.todayMetaText}>⛅ 28°C  •  🚶 15 min de ti</Text>
              <TouchableOpacity
                style={styles.goToMapBtn}
                onPress={() => router.push('/(tabs)/mapa?q=Parque del Retiro' as any)}
              >
                <Text style={styles.goToMapBtnText}>Ver ruta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Lista de Actividades */}
        <Text style={styles.sectionHeading}>Actividades sugeridas</Text>
        <View style={styles.activitiesList}>
          {filtered.map((act) => (
            <View key={act.id} style={styles.activityCard}>
              <Image source={{ uri: act.image }} style={styles.activityImage} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {act.title}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {act.rating} ({act.reviews})
                  </Text>
                </View>
                <Text style={styles.durationText}>{act.duration}</Text>
                <Text style={styles.priceText}>{act.price}</Text>

                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => router.push(`/(tabs)/mapa?q=${encodeURIComponent(`${act.title} ${act.location}`)}` as any)}
                >
                  <Text style={styles.mapBtnText}>Ver en mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
  iconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  searchWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 18,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 42,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
  },
  todayBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sunCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  todayDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  todayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
  },
  goToMapBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goToMapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  activitiesList: {
    gap: 14,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  activityImage: {
    width: 90,
    height: 110,
    borderRadius: 14,
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  mapBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  mapBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
})
