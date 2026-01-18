import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../store/auth.store'
import { PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout() {
    const segments = useSegments()
    const router = useRouter()
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

    // Verificar autenticación al iniciar
    useEffect(() => {
        checkAuth()
    }, [])

    // Redirigir según estado de autenticación
    useEffect(() => {
        if (isLoading) return

        const inAuthGroup = segments[0] === '(auth)'

        if (!isAuthenticated && !inAuthGroup) {
            // Usuario no autenticado, redirigir a login
            router.replace('/(auth)/login')
        } else if (isAuthenticated && inAuthGroup) {
            // Usuario autenticado en pantalla de auth, redirigir a home
            router.replace('/(tabs)')
        }
    }, [isAuthenticated, segments, isLoading])

    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </PaperProvider>
        </QueryClientProvider>
    )
}
