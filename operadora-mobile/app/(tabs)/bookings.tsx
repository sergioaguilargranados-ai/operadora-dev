import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, SegmentedButtons, Chip, Button, Avatar } from 'react-native-paper'
import { useState } from 'react'
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

import BookingsService, { Booking } from '../../services/bookings.service'

export default function BookingsScreen() {
    const [view, setView] = useState('upcoming')
    const [refreshing, setRefreshing] = useState(false)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBookings = async () => {
        try {
            const data = await BookingsService.getMyBookings()
            setBookings(data)
        } catch (error) {
            console.error('Error loading bookings:', error)
            // Optionally show user feedback here
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const onRefresh = () => {
        setRefreshing(true)
        fetchBookings()
    }

    // Filter bookings based on view (simplistic logic for now)
    const filteredBookings = bookings.filter(b => {
        if (view === 'upcoming') return b.status === 'confirmed' || b.status === 'pending'
        return b.status === 'completed' || b.status === 'cancelled'
    })

    // If no real data yet, fallback to UI test if empty? 
    // For now, let's trust the service or show empty state.
    const displayBookings = filteredBookings

    const renderBookingItem = ({ item }: { item: any }) => (
        <Card style={styles.card}>
            <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.rowBetween}>
                    <Text style={styles.bookingTitle}>{item.title}</Text>
                    <Chip
                        icon={item.status === 'confirmed' ? 'check-circle' : 'check'}
                        style={[styles.statusChip, item.status === 'confirmed' ? styles.statusConfirmed : styles.statusCompleted]}
                        textStyle={styles.statusText}
                        compact
                    >
                        {item.status === 'confirmed' ? 'Confirmado' : 'Completado'}
                    </Chip>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <Text style={styles.detailsText}>{item.details}</Text>
                </View>

            </Card.Content>
            <Card.Actions style={styles.cardActions}>
                <Button
                    mode="text"
                    onPress={() => router.push(`/booking-details/${item.id}`)}
                >
                    Ver Detalles
                </Button>
            </Card.Actions>
        </Card>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Mis Reservas</Text>

                <SegmentedButtons
                    value={view}
                    onValueChange={setView}
                    buttons={[
                        {
                            value: 'upcoming',
                            label: 'Próximos',
                            icon: 'calendar-clock',
                        },
                        {
                            value: 'past',
                            label: 'Pasados',
                            icon: 'history',
                        },
                    ]}
                    style={styles.tabs}
                />

                <FlatList
                    data={filteredBookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Avatar.Icon size={64} icon="airplane-off" style={{ backgroundColor: Colors.background }} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>No tienes reservas {view === 'upcoming' ? 'próximas' : 'pasadas'}</Text>
                            <Button mode="contained" onPress={() => router.push('/(tabs)/search')} style={{ marginTop: Spacing.md }}>
                                Buscar Viajes
                            </Button>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        padding: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    tabs: {
        marginBottom: Spacing.md,
    },
    listContent: {
        paddingBottom: Spacing.xl,
    },
    card: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    cardImage: {
        height: 140,
    },
    cardContent: {
        paddingTop: Spacing.md,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    bookingTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    statusChip: {
        height: 24,
    },
    statusConfirmed: {
        backgroundColor: '#DCFCE7', // Green 100
    },
    statusCompleted: {
        backgroundColor: '#F3F4F6', // Gray 100
    },
    statusText: {
        fontSize: 10,
        marginVertical: 0,
        color: Colors.textSecondary,
    },
    detailsContainer: {
        marginTop: Spacing.xs,
    },
    dateText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    detailsText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    cardActions: {
        justifyContent: 'flex-end',
        paddingHorizontal: Spacing.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
})
