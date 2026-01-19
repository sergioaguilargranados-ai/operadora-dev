import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native'
import { Text, Button, Card, Divider, TextInput, RadioButton, ActivityIndicator } from 'react-native-paper'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import BookingsService from '../services/bookings.service'
import PaymentsService from '../services/payments.service'
import { useStripe } from '@stripe/stripe-react-native'
import * as ExpoLinking from 'expo-linking'

export default function CheckoutScreen() {
    const params = useLocalSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('card')
    const { initPaymentSheet, presentPaymentSheet } = useStripe()

    // Parse item data passed via params
    const item = params.item ? JSON.parse(params.item as string) : null
    const type = params.type as string

    // Deep Linking Handler for returns from PayPal/MP
    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            const { path, queryParams } = ExpoLinking.parse(event.url)
            console.log('Deep link received:', path, queryParams)
            if (path === 'checkout') {
                // Check status if passed in query
                Alert.alert('Estado de Pago', 'Por favor verifica si tu pago fue completado.') // Simplification
            }
        }

        const subscription = Linking.addEventListener('url', handleDeepLink)
        return () => subscription.remove()
    }, [])

    const handlePayment = async () => {
        if (!item) return
        setLoading(true)

        try {
            // 1. Create Booking (Pending)
            // Note: Data structure aligned with backend expectations 
            // In a real scenario, this matches your DB schema exactly.
            const bookingPayload = {
                service_type: type,
                service_id: item.id,
                service_name: item.name || item.airline || item.title || 'Servicio',
                total_price: item.price,
                payment_status: 'pending',
                booking_status: 'pending',
                booking_details: {
                    dates: params.dates,
                    guests: 2, // Example
                    ...item
                }
            }

            // Create booking to get ID
            const bookingResponse = await BookingsService.createBooking(bookingPayload)

            if (!bookingResponse || !bookingResponse.success) {
                throw new Error('No se pudo crear la reserva inicial.')
            }

            const bookingId = bookingResponse.data.id
            const userId = 1 // Mock user ID (should come from Auth Store)
            const tenantId = 1 // Mock tenant ID
            const amount = item.price
            const currency = 'usd' // Should be dynamic
            const returnUrl = ExpoLinking.createURL('checkout')

            // 2. Process Payment based on Method
            if (paymentMethod === 'card') {
                // Stripe Flow
                const intentResponse = await PaymentsService.createPaymentIntent({
                    bookingId,
                    userId,
                    tenantId,
                    amount: Math.round(amount * 100), // cents
                    currency,
                    description: `Pago Reserva #${bookingId}`
                })

                if (!intentResponse.success) throw new Error(intentResponse.error || 'Error iniciando Stripe')

                const { error: initError } = await initPaymentSheet({
                    merchantDisplayName: "AS Operadora",
                    customerId: intentResponse.customerId, // Optional if returned
                    paymentIntentClientSecret: intentResponse.clientSecret,
                    defaultBillingDetails: { name: 'Cliente' },
                    returnURL: returnUrl
                })

                if (initError) throw new Error(initError.message)

                const { error: paymentError } = await presentPaymentSheet()

                if (paymentError) {
                    throw new Error(paymentError.message)
                } else {
                    // Success
                    Alert.alert('¡Pago Exitoso!', 'Tu reserva con tarjeta ha sido confirmada.', [
                        { text: 'Ver Mis Viajes', onPress: () => router.replace('/(tabs)/bookings') }
                    ])
                }

            } else if (paymentMethod === 'paypal') {
                // PayPal Flow
                const orderResponse = await PaymentsService.createPayPalOrder({
                    bookingId,
                    userId,
                    tenantId,
                    amount: amount.toString(),
                    currency: currency.toUpperCase(),
                    description: `Reserva #${bookingId}`,
                    returnUrl: returnUrl,
                    cancelUrl: returnUrl
                })

                if (!orderResponse.success) throw new Error(orderResponse.error || 'Error iniciando PayPal')

                if (orderResponse.approvalUrl) {
                    await Linking.openURL(orderResponse.approvalUrl)
                    // After returning, user typically checks status manually or we poll
                    Alert.alert('Procesando PayPal', 'Si completaste el pago, tu reserva se confirmará en breve.', [
                        { text: 'Ir a Mis Viajes', onPress: () => router.replace('/(tabs)/bookings') }
                    ])
                }

            } else if (paymentMethod === 'mercadopago') {
                // Mercado Pago Flow
                const mpResponse = await PaymentsService.createMercadoPagoPreference({
                    bookingId,
                    userId,
                    tenantId,
                    amount: amount,
                    currency: 'MXN', // Force MXN usually for MP or convert
                    title: `Reserva ${item.name}`,
                    description: `Reserva #${bookingId}`,
                    returnUrl: returnUrl
                })

                if (!mpResponse.success) throw new Error(mpResponse.error || 'Error iniciando Mercado Pago')

                // Open Sandbox Init Point (or regular initPoint in prod)
                // Using sandbox for now as implied by test credentials
                const link = mpResponse.sandboxInitPoint || mpResponse.initPoint
                if (link) {
                    await Linking.openURL(link)
                    Alert.alert('Procesando Mercado Pago', 'Si completaste el pago, tu reserva se confirmará en breve.', [
                        { text: 'Ir a Mis Viajes', onPress: () => router.replace('/(tabs)/bookings') }
                    ])
                }
            }

        } catch (error: any) {
            console.error(error)
            Alert.alert('Error', error.message || 'Hubo un problema al procesar el pago.')
        } finally {
            setLoading(false)
        }
    }

    if (!item) return <View style={styles.center}><Text>Error: Item not found</Text></View>

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Confirmar y Pagar',
                    headerTintColor: Colors.primary,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Resumen de Reserva */}
                <Text style={styles.sectionTitle}>Resumen de tu Viaje</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.itemTitle}>{item.name || item.airline || item.title}</Text>
                        <Text style={styles.itemSubtitle}>{item.location || item.provider || (item.origin + ' - ' + item.destination)}</Text>
                        <Divider style={styles.divider} />
                        <View style={styles.rowBetween}>
                            <Text>Fechas:</Text>
                            <Text style={styles.bold}>{params.dates || 'Fechas seleccionadas'}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text>Pasajeros:</Text>
                            <Text style={styles.bold}>2 Adultos</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Método de Pago */}
                <Text style={styles.sectionTitle}>Método de Pago</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                            <View style={styles.radioRow}>
                                <RadioButton value="card" color={Colors.primary} />
                                <Text style={styles.radioLabel}>Tarjeta Crédito/Débito (Stripe)</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="paypal" color={Colors.primary} />
                                <Text style={styles.radioLabel}>PayPal</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="mercadopago" color={Colors.primary} />
                                <Text style={styles.radioLabel}>Mercado Pago</Text>
                            </View>
                        </RadioButton.Group>

                        {paymentMethod === 'card' && (
                            <View style={styles.cardForm}>
                                <Text style={{ color: Colors.textSecondary, marginBottom: 10 }}>
                                    El pago se procesará de forma segura a través de Stripe.
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Política de Cancelación */}
                <Text style={styles.infoText}>
                    Cancelación gratuita hasta 24 horas antes del viaje.
                </Text>

            </ScrollView>

            {/* Footer Fijo de Pago */}
            <View style={styles.footer}>
                <View style={styles.rowBetween}>
                    <Text style={styles.totalLabel}>Total a Pagar:</Text>
                    <Text style={styles.totalAmount}>${item.price?.toLocaleString('en-US') || '0'}</Text>
                </View>
                <Button
                    mode="contained"
                    onPress={handlePayment}
                    style={styles.payButton}
                    contentStyle={{ height: 50 }}
                    loading={loading}
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : 'Pagar Ahora'}
                </Button>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    card: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
    },
    itemTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    itemSubtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    divider: {
        marginVertical: Spacing.sm,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    bold: {
        fontWeight: '600',
        color: Colors.text,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    radioLabel: {
        fontSize: FontSizes.md,
        color: Colors.text,
        marginLeft: 8,
    },
    cardForm: {
        marginTop: Spacing.md,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8
    },
    infoText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginVertical: Spacing.md,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        elevation: 8,
    },
    totalLabel: {
        fontSize: FontSizes.lg,
        color: Colors.text,
    },
    totalAmount: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    payButton: {
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary
    }
})

