import React, { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth.store'
import api from '../../services/api'

export default function MobileActiveItineraryRedirect() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.id) {
      router.replace('/(auth)/login')
      return
    }

    const fetchAndRedirect = async () => {
      try {
        const res = await api.get(`/bookings?userId=${user.id}`)
        if (res.data?.success && Array.isArray(res.data.data)) {
          const bookingsList = res.data.data
          let nearestTripId: string | null = null
          let nearestDiff = Infinity
          const now = new Date().getTime()

          bookingsList.forEach((b: any) => {
            try {
              const details =
                typeof b.special_requests === 'string'
                  ? JSON.parse(b.special_requests)
                  : b.special_requests || {}
              const tripId = details.tour_id || b.id.toString()
              const tripDate = new Date(
                b.travel_date || details.fecha_inicio || b.created_at
              ).getTime()

              if (tripDate >= now) {
                const diff = tripDate - now
                if (diff < nearestDiff) {
                  nearestDiff = diff
                  nearestTripId = tripId
                }
              }
            } catch (e) {}
          })

          if (nearestTripId) {
            router.replace(`/itinerario/${nearestTripId}` as any)
          } else if (bookingsList.length > 0) {
            const firstTripId =
              bookingsList[0].special_requests?.tour_id || bookingsList[0].id.toString()
            router.replace(`/itinerario/${firstTripId}` as any)
          } else {
            router.replace('/(tabs)/itinerario' as any)
          }
        } else {
          router.replace('/(tabs)/itinerario' as any)
        }
      } catch (error) {
        console.warn('Error redirecting to active trip', error)
        router.replace('/(tabs)/itinerario' as any)
      }
    }

    fetchAndRedirect()
  }, [user?.id])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1D4ED8" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
