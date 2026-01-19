import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { StripeProvider } from '@stripe/stripe-react-native'
import NotificationsService from '../services/notifications.service'

const queryClient = new QueryClient()

export default function RootLayout() {
    const segments = useSegments()
    const router = useRouter()
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

    // Verificar autenticación e inicializar servicios
    useEffect(() => {
        checkAuth()
        NotificationsService.registerForPushNotificationsAsync()
    }, [])

    // ... (keep auth logic)

    return (
        <StripeProvider
            publishableKey="pk_test_51SmfrGJ4lb8aEBzQ6vsqXLlK5HSK0ycumxd6JypI9ZKWhRjb7xRQEStwJKGKzlhMrA3iN61fTlGJkAHIRl7mTQyu00tMGs4woY"
            merchantIdentifier="merchant.com.operadora.app" // Optional, for Apple Pay
        >
            <QueryClientProvider client={queryClient}>
                <PaperProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </PaperProvider>
            </QueryClientProvider>
        </StripeProvider>
    )
}
