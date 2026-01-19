import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Divider, Card, Chip, Surface } from 'react-native-paper'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import BookingsService, { Booking } from '../../services/bookings.service'
import QRCode from 'react-native-qrcode-svg'

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams()
    const router = useRouter()
    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDetails = async () => {
            if (typeof id !== 'string') return
            try {
                const data = await BookingsService.getBookingDetails(id)
                setBooking(data)
            } catch (error) {
                console.error("Error loading booking details", error)
            } finally {
                setLoading(false)
            }
        }
        loadDetails()
    }, [id])

    if (loading || !booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Cargando detalles...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Detalle de Reserva',
                    headerTintColor: Colors.primary,
                    headerShadowVisible: false,
                    headerBackTitle: 'Atrás'
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Status Banner */}
                <Surface style={[styles.statusBanner, booking.booking_status === 'confirmed' ? styles.bgSuccess : styles.bgPending]} elevation={2}>
                    <Text style={[styles.statusText, booking.booking_status === 'confirmed' ? styles.textSuccess : styles.textPending]}>
                        {booking.booking_status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE'}
                    </Text>
                    <Text style={styles.refText}>Ref: {booking.booking_reference}</Text>
                </Surface>

                {/* Main Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.serviceName}>{booking.service_name}</Text>
                        <Text style={styles.dateInfo}>Reservado el: {new Date(booking.created_at).toLocaleDateString()}</Text>

                        <Divider style={styles.divider} />

                        <View style={styles.qrContainer}>
                            <QRCode
                                value={booking.booking_reference || 'NO-REF'}
                                size={150}
                            />
                            <Text style={styles.qrLabel}>Escanea este código en recepción</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Pax Info */}
                <Card style={styles.card}>
                    <Card.Title title="Pasajeros / Huéspedes" left={(props) => <Card.Cover {...props} source={{ uri: 'https://ui-avatars.com/api/?name=User' }} style={{ width: 40, height: 40, borderRadius: 20 }} />} />
                    <Card.Content>
                        <Text>{booking.holder_name?.first_name} {booking.holder_name?.last_name}</Text>
                        <Text style={styles.subText}>{booking.contact_details?.email}</Text>
                        <Text style={styles.subText}>{booking.contact_details?.phone}</Text>
                    </Card.Content>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button mode="contained" icon="download" style={styles.button} onPress={() => { }}>
                        Descargar Voucher PDF
                    </Button>
                    <Button mode="outlined" icon="help-circle" style={styles.button} onPress={() => { }}>
                        Ayuda / Soporte
                    </Button>
                </View>

            </ScrollView>
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
    },
    card: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
    },
    statusBanner: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bgSuccess: { backgroundColor: '#DCFCE7' },
    bgPending: { backgroundColor: '#FEF3C7' },
    textSuccess: { color: '#166534', fontWeight: 'bold' },
    textPending: { color: '#92400E', fontWeight: 'bold' },
    statusText: { fontSize: FontSizes.md },
    refText: { fontSize: FontSizes.sm, color: Colors.textSecondary },

    serviceName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center'
    },
    dateInfo: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.md
    },
    divider: {
        marginVertical: Spacing.md
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: Spacing.sm
    },
    qrLabel: {
        marginTop: Spacing.sm,
        color: Colors.textSecondary,
        fontSize: FontSizes.xs
    },
    subText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm
    },
    actions: {
        marginTop: Spacing.sm
    },
    button: {
        marginBottom: Spacing.sm
    }
})
