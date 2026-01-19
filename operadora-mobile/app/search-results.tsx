import { View, StyleSheet, FlatList, Image } from 'react-native'
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'

// Mock Data
const MOCK_HOTELS = [
    {
        id: '1',
        name: 'Grand Velas Riviera Maya',
        location: 'Riviera Maya, México',
        price: 12500,
        rating: 4.9,
        image: 'https://source.unsplash.com/800x600/?luxury,hotel,1',
        amenities: ['All Inclusive', 'Spa', 'Playa'],
    },
    {
        id: '2',
        name: 'Xcaret Arte',
        location: 'Playa del Carmen, México',
        price: 15800,
        rating: 5.0,
        image: 'https://source.unsplash.com/800x600/?resort,pool,2',
        amenities: ['Parques Incluidos', 'Adults Only'],
    },
    {
        id: '3',
        name: 'Hard Rock Hotel',
        location: 'Cancún, México',
        price: 8900,
        rating: 4.5,
        image: 'https://source.unsplash.com/800x600/?hotel,room,3',
        amenities: ['Music Lab', 'Familiar'],
    },
]

const MOCK_FLIGHTS = [
    {
        id: '1',
        airline: 'Aeroméxico',
        code: 'AM 502',
        origin: 'MEX',
        destination: 'CUN',
        departure: '08:00',
        arrival: '10:30',
        price: 3500,
        duration: '2h 30m',
        logo: 'https://source.unsplash.com/100x100/?logo,airline',
    },
    {
        id: '2',
        airline: 'Volaris',
        code: 'Y4 720',
        origin: 'MEX',
        destination: 'CUN',
        departure: '14:00',
        arrival: '16:35',
        price: 2800,
        duration: '2h 35m',
        logo: 'https://source.unsplash.com/100x100/?plane,logo',
    },
]

export default function SearchResultsScreen() {
    const params = useLocalSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState<any[]>([])

    const searchType = params.type || 'hotels'

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            if (searchType === 'hotels') {
                setResults(MOCK_HOTELS)
            } else if (searchType === 'flights') {
                setResults(MOCK_FLIGHTS)
            }
            setLoading(false)
        }, 1500)
    }, [searchType])

    const renderHotelItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => console.log('Press hotel', item.id)}>
            <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.rowBetween}>
                    <Text style={styles.hotelName}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    </View>
                </View>
                <Text style={styles.location}>{item.location}</Text>

                <View style={styles.amenitiesRow}>
                    {item.amenities.map((amenity: string) => (
                        <Chip key={amenity} icon="check" style={styles.chip} textStyle={styles.chipText} compact>
                            {amenity}
                        </Chip>
                    ))}
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Por noche desde</Text>
                    <Text style={styles.price}>${item.price.toLocaleString()}</Text>
                </View>
            </Card.Content>
        </Card>
    )

    const renderFlightItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => console.log('Press flight', item.id)}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.rowBetween}>
                    <View style={styles.airlineInfo}>
                        <Image source={{ uri: item.logo }} style={styles.airlineLogo} />
                        <View>
                            <Text style={styles.airlineName}>{item.airline}</Text>
                            <Text style={styles.flightCode}>{item.code}</Text>
                        </View>
                    </View>
                    <Text style={styles.price}>${item.price.toLocaleString()}</Text>
                </View>

                <View style={styles.flightRoute}>
                    <View style={styles.routePoint}>
                        <Text style={styles.time}>{item.departure}</Text>
                        <Text style={styles.airport}>{item.origin}</Text>
                    </View>

                    <View style={styles.flightDuration}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.stopsText}>Directo</Text>
                    </View>

                    <View style={styles.routePoint}>
                        <Text style={styles.time}>{item.arrival}</Text>
                        <Text style={styles.airport}>{item.destination}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: searchType === 'hotels' ? 'Resultados de Hoteles' : 'Vuelos Disponibles',
                    headerTintColor: Colors.primary,
                    headerShadowVisible: false,
                }}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Buscando mejores opciones...</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={searchType === 'hotels' ? renderHotelItem : renderFlightItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
    },
    listContent: {
        padding: Spacing.md,
    },
    card: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    cardImage: {
        height: 150,
    },
    cardContent: {
        padding: Spacing.md,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hotelName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    location: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    ratingBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    ratingText: {
        color: Colors.white,
        fontSize: FontSizes.xs,
        fontWeight: 'bold',
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.md,
    },
    chip: {
        marginRight: Spacing.xs,
        marginBottom: 4,
        backgroundColor: Colors.backgroundDark,
        height: 24,
    },
    chipText: {
        fontSize: 10,
        marginVertical: 0,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
    },
    priceLabel: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginRight: Spacing.xs,
    },
    price: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    // Flight Styles
    airlineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    airlineLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: Spacing.sm,
        backgroundColor: Colors.backgroundDark,
    },
    airlineName: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.text,
    },
    flightCode: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
    flightRoute: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    routePoint: {
        alignItems: 'center',
    },
    time: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
    },
    airport: {
        fontSize: FontSizes.lg,
        color: Colors.textSecondary,
    },
    flightDuration: {
        alignItems: 'center',
        flex: 1,
    },
    durationText: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    divider: {
        height: 1,
        width: '60%',
        backgroundColor: Colors.border,
        marginBottom: 4,
    },
    stopsText: {
        fontSize: FontSizes.xs,
        color: Colors.success,
    },
})
