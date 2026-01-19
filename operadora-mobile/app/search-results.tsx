import { View, StyleSheet, FlatList, Image } from 'react-native'
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import HotelsService from '../services/hotels.service'

import FlightsService from '../services/flights.service'

// Mock Data
const MOCK_HOTELS = [
    // ... Mock data for hotels only if service fails or for fallback visualization
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

export default function SearchResultsScreen() {
    const params = useLocalSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [results, setResults] = useState<any[]>([])

    const searchType = params.type || 'hotels'

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true)
            try {
                if (searchType === 'hotels') {
                    // Call real API
                    const searchParams = {
                        destination: (params.destination as string) || '',
                        checkIn: (params.dates as string)?.split(' - ')[0] || '', // Simple parsing assumption
                        checkOut: (params.dates as string)?.split(' - ')[1] || '',
                        guests: 2 // Default for now
                    }

                    const hotels = await HotelsService.search(searchParams)
                    // Fallback to mock if API returns empty (only for demo purposes)
                    setResults(hotels.length > 0 ? hotels : MOCK_HOTELS)
                } else if (searchType === 'flights') {
                    setLoading(true)
                    try {
                        const flightParams = {
                            origin: 'MEX', // Hardcoded for now, should come from params
                            destination: (params.destination as string) || 'CUN',
                            date: (params.dates as string) || '2026-02-20'
                        }
                        const flights = await FlightsService.search(flightParams)
                        setResults(flights)
                    } catch (error) {
                        console.error('Error fetching flights:', error)
                        setResults([])
                    }
                } else if (searchType === 'autos') {
                    // Autos Logic
                    const autoParams = {
                        pickup: (params.destination as string) || 'MEX',
                        dropoff: (params.destination as string) || 'MEX',
                        pickupDate: (params.dates as string)?.split(' - ')[0] || '2026-02-20',
                        dropoffDate: (params.dates as string)?.split(' - ')[1] || '2026-02-25'
                    }
                    // If no dates provided, use defaults to avoid API error
                    const autos = await AutosService.search(autoParams)
                    setResults(autos)
                }
            } catch (error) {
                console.error('Search error:', error)
                // TODO: Show error toast/alert
                // Use fallback mock only on error to prevent empty screen during demo
                if (searchType === 'hotels') setResults(MOCK_HOTELS)
                else setResults([])
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [searchType, params])

    const handleBook = (item: any) => {
        // Normalize type for backend (hotels -> hotel)
        const normalizedType = searchType.slice(0, -1)

        router.push({
            pathname: '/checkout',
            params: {
                type: normalizedType,
                item: JSON.stringify(item),
                dates: params.dates || '20 Ene - 25 Ene' // Fallback for demo
            }
        })
    }

    const renderHotelItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => handleBook(item)}>
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
                <Button mode="contained" onPress={() => handleBook(item)} style={{ marginTop: 8 }}>Reservar Ahora</Button>
            </Card.Content>
        </Card>
    )

    const renderFlightItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => handleBook(item)}>
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
                <Button mode="contained" onPress={() => handleBook(item)} style={{ marginTop: 16 }}>Seleccionar Vuelo</Button>
            </Card.Content>
        </Card>
    )

    const renderAutoItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => handleBook(item)}>
            <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
            <Card.Content style={styles.cardContent}>
                <View style={styles.rowBetween}>
                    <Text style={styles.hotelName}>{item.name}</Text>
                    <Chip compact>{item.type}</Chip>
                </View>
                <Text style={styles.location}>{item.provider}</Text>

                <View style={styles.amenitiesRow}>
                    <Chip icon="car-shift-pattern" style={styles.chip} textStyle={styles.chipText} compact>{item.transmission}</Chip>
                    <Chip icon="account-group" style={styles.chip} textStyle={styles.chipText} compact>{item.passengers} Pasajeros</Chip>
                    <Chip icon="bag-suitcase" style={styles.chip} textStyle={styles.chipText} compact>{item.bags} Maletas</Chip>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total desde</Text>
                    <Text style={styles.price}>${item.price.toLocaleString()} {item.currency}</Text>
                </View>
                <Button mode="contained" onPress={() => handleBook(item)} style={{ marginTop: 8 }}>Rentar Auto</Button>
            </Card.Content>
        </Card>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: searchType === 'hotels' ? 'Resultados de Hoteles' : searchType === 'flights' ? 'Vuelos Disponibles' : 'Autos Disponibles',
                    headerTintColor: Colors.primary,
                    headerShadowVisible: false,
                }}
            />

            {loading ? (
                <View style={styles.listContent}>
                    {[1, 2, 3].map(i => (
                        <Card key={i} style={[styles.card, { opacity: 0.7 }]}>
                            <View style={{ height: 150, backgroundColor: '#E0E0E0' }} />
                            <Card.Content style={styles.cardContent}>
                                <View style={{ height: 20, width: '60%', backgroundColor: '#E0E0E0', marginBottom: 8 }} />
                                <View style={{ height: 14, width: '40%', backgroundColor: '#E0E0E0', marginBottom: 16 }} />
                                <View style={{ height: 24, width: '30%', backgroundColor: '#E0E0E0' }} />
                            </Card.Content>
                        </Card>
                    ))}
                    <Text style={[styles.loadingText, { textAlign: 'center' }]}>Buscando las mejores ofertas...</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={
                        searchType === 'hotels' ? renderHotelItem :
                            searchType === 'flights' ? renderFlightItem :
                                renderAutoItem
                    }
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486777.png' }}
                                style={{ width: 100, height: 100, marginBottom: 16, opacity: 0.5 }}
                            />
                            <Text style={styles.emptyText}>No encontramos resultados para tu búsqueda.</Text>
                            <Button mode="text" onPress={() => router.back()}>Intentar con otras fechas</Button>
                        </View>
                    }
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
