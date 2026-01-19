import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, SegmentedButtons, Chip, Button } from 'react-native-paper'
import { useState } from 'react'
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

// Mock Data
const UPCOMING_BOOKINGS = [
    {
        id: '1',
        type: 'flight',
        title: 'Vuelo a Cancún',
        date: '20 Ene 2026',
        status: 'confirmed',
        details: 'Aeroméxico • AM 502',
        image: 'https://source.unsplash.com/800x600/?plane,sky',
    },
    {
        id: '2',
        type: 'hotel',
        title: 'Grand Velas Riviera',
        date: '20 Ene - 25 Ene',
        status: 'confirmed',
        details: '2 Adultos • All Inclusive',
        image: 'https://source.unsplash.com/800x600/?hotel,luxury',
    },
]

const PAST_BOOKINGS = [
    {
        id: '3',
        type: 'hotel',
        title: 'Hilton Reforma',
        date: '15 Dic 2025',
        status: 'completed',
        details: '1 Noche • Negocios',
        image: 'https://source.unsplash.com/800x600/?hotel,city',
    },
]

export default function BookingsScreen() {
    const [view, setView] = useState('upcoming')
    const [refreshing, setRefreshing] = useState(false)

    const bookings = view === 'upcoming' ? UPCOMING_BOOKINGS : PAST_BOOKINGS

    const onRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

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
                <Button mode="text" onPress={() => { }}>Ver Detalles</Button>
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
                    data={bookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tienes reservas {view === 'upcoming' ? 'próximas' : 'pasadas'}</Text>
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
