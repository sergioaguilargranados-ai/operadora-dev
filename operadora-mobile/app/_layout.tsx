import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StripeProvider } from '../services/stripe'
import { useAuthStore } from '../store/auth.store'
import { config } from '../constants/config'
import NotificationsService from '../services/notifications.service'
import OfflineBanner from '../components/ui/OfflineBanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 min
    },
  },
})

export default function RootLayout() {
  const segments = useSegments()
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    NotificationsService.registerForPushNotificationsAsync()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    }
  }, [isAuthenticated, segments, isLoading])

  return (
    <StripeProvider
      publishableKey={config.stripe.publishableKey}
      merchantIdentifier="merchant.com.asoperadora.app"
    >
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <StatusBar style="auto" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="itinerario/[id]/index" />
            <Stack.Screen name="itinerario/active" />
            <Stack.Screen name="pagos/index" />
            <Stack.Screen name="pagos/nuevo" />
            <Stack.Screen name="perfil/index" />
            <Stack.Screen name="perfil/password" />
            <Stack.Screen name="perfil/documentos" />
            <Stack.Screen name="tienda/index" />
            <Stack.Screen name="tienda/carrito" />
            <Stack.Screen name="viajes-grupales" />
            <Stack.Screen name="actividades" />
            <Stack.Screen name="ayuda" />
            <Stack.Screen name="notificaciones" />
          </Stack>
        </PaperProvider>
      </QueryClientProvider>
    </StripeProvider>
  )
}
