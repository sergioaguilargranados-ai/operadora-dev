import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, FAB, Portal, Modal } from 'react-native-paper'
import { useLocalSearchParams } from 'expo-router'
import InfiniteScrollList from '../../components/InfiniteScrollList'
import AdvancedFilters from '../../components/AdvancedFilters'
import { Colors, Spacing, FontSizes } from '../../constants/theme'
import FlightsService, { Flight } from '../../services/flights.service'

// Definición de filtros para vuelos
const FLIGHT_FILTERS = [
    {
        id: 'stops',
        title: 'Escalas',
        options: [
            { id: 'direct', label: 'Directo', value: 0, type: 'checkbox' as const },
            { id: '1stop', label: '1 Escala', value: 1, type: 'checkbox' as const },
            { id: '2stops', label: '2+ Escalas', value: 2, type: 'checkbox' as const },
        ],
    },
    {
        id: 'airlines',
        title: 'Aerolíneas',
        options: [
            { id: 'am', label: 'Aeroméxico', value: 'AM', type: 'checkbox' as const },
            { id: 'y4', label: 'Volaris', value: 'Y4', type: 'checkbox' as const },
            { id: 'vb', label: 'Viva Aerobus', value: 'VB', type: 'checkbox' as const },
            { id: 'ua', label: 'United', value: 'UA', type: 'checkbox' as const },
        ],
    },
    {
        id: 'price',
        title: 'Precio',
        options: [
            { id: 'low', label: 'Menos de $5,000', value: 5000, type: 'checkbox' as const },
            { id: 'mid', label: '$5,000 - $10,000', value: 10000, type: 'checkbox' as const },
            { id: 'high', label: 'Más de $10,000', value: 15000, type: 'checkbox' as const },
        ],
    },
    {
        id: 'time',
        title: 'Horario de Salida',
        options: [
            { id: 'morning', label: 'Mañana (6-12)', value: 'morning', type: 'checkbox' as const },
            { id: 'afternoon', label: 'Tarde (12-18)', value: 'afternoon', type: 'checkbox' as const },
            { id: 'evening', label: 'Noche (18-24)', value: 'evening', type: 'checkbox' as const },
        ],
    },
]

export default function FlightResultsScreen() {
    const params = useLocalSearchParams()
    const [flights, setFlights] = useState<Flight[]>([])
    const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: any }>({
        stops: [],
        airlines: [],
        price: [],
        time: [],
    })

    useEffect(() => {
        loadFlights()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [flights, selectedFilters])

    const loadFlights = async () => {
        try {
            setLoading(true)
            const searchParams = {
                origin: params.origin as string || 'MEX',
                destination: params.destination as string || 'CUN',
                date: params.date as string || '2026-02-01',
            }

            const results = await FlightsService.search(searchParams)
            setFlights(results)
            setHasMore(false) // En producción, verificar si hay más páginas
        } catch (error) {
            console.error('Error loading flights:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadMore = async () => {
        // Simulación de paginación
        // En producción, cargar la siguiente página desde la API
        setPage(page + 1)
    }

    const handleRefresh = async () => {
        setPage(1)
        await loadFlights()
    }

    const applyFilters = () => {
        let filtered = [...flights]

        // Filtrar por aerolíneas
        if (selectedFilters.airlines.length > 0) {
            filtered = filtered.filter(flight =>
                selectedFilters.airlines.some((airline: string) =>
                    flight.airline.includes(airline)
                )
            )
        }

        // Filtrar por precio
        if (selectedFilters.price.length > 0) {
            filtered = filtered.filter(flight => {
                return selectedFilters.price.some((maxPrice: number) => {
                    if (maxPrice === 5000) return flight.price < 5000
                    if (maxPrice === 10000) return flight.price >= 5000 && flight.price < 10000
                    if (maxPrice === 15000) return flight.price >= 10000
                    return true
                })
            })
        }

        setFilteredFlights(filtered)
    }

    const handleFilterChange = (filterId: string, value: any) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: value,
        }))
    }

    const handleApplyFilters = () => {
        setShowFilters(false)
        applyFilters()
    }

    const handleClearFilters = () => {
        setSelectedFilters({
            stops: [],
            airlines: [],
            price: [],
            time: [],
        })
    }

    const renderFlight = ({ item }: { item: Flight }) => (
        <Card style={styles.flightCard}>
            <Card.Content>
                <View style={styles.flightHeader}>
                    <Text style={styles.airline}>{item.airline}</Text>
                    <Text style={styles.code}>{item.code}</Text>
                </View>

                <View style={styles.flightRoute}>
                    <View style={styles.routePoint}>
                        <Text style={styles.time}>{item.departure}</Text>
                        <Text style={styles.airport}>{item.origin}</Text>
                    </View>

                    <View style={styles.routeLine}>
                        <View style={styles.line} />
                        <Text style={styles.duration}>{item.duration}</Text>
                    </View>

                    <View style={styles.routePoint}>
                        <Text style={styles.time}>{item.arrival}</Text>
                        <Text style={styles.airport}>{item.destination}</Text>
                    </View>
                </View>

                <View style={styles.flightFooter}>
                    <Text style={styles.price}>${item.price.toLocaleString()}</Text>
                </View>
            </Card.Content>
        </Card>
    )

    const activeFiltersCount = Object.values(selectedFilters).reduce(
        (count, filters) => count + (Array.isArray(filters) ? filters.length : 0),
        0
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {filteredFlights.length} vuelos encontrados
                </Text>
                {activeFiltersCount > 0 && (
                    <Text style={styles.filterCount}>
                        {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            <InfiniteScrollList
                data={filteredFlights}
                renderItem={renderFlight}
                onLoadMore={loadMore}
                onRefresh={handleRefresh}
                hasMore={hasMore}
                loading={loading}
                keyExtractor={(item) => item.id}
                estimatedItemSize={150}
            />

            <FAB
                icon="filter"
                label="Filtros"
                style={styles.fab}
                onPress={() => setShowFilters(true)}
            />

            <Portal>
                <Modal
                    visible={showFilters}
                    onDismiss={() => setShowFilters(false)}
                    contentContainerStyle={styles.modal}
                >
                    <AdvancedFilters
                        filters={FLIGHT_FILTERS}
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                        onApply={handleApplyFilters}
                        onClear={handleClearFilters}
                    />
                </Modal>
            </Portal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
    },
    filterCount: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        marginTop: 4,
    },
    flightCard: {
        margin: Spacing.md,
        marginBottom: 0,
        backgroundColor: Colors.white,
    },
    flightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    airline: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
    },
    code: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    flightRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    routePoint: {
        flex: 1,
    },
    time: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    airport: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    routeLine: {
        flex: 2,
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    line: {
        height: 2,
        backgroundColor: Colors.border,
        width: '100%',
        marginBottom: 4,
    },
    duration: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
    flightFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    price: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    fab: {
        position: 'absolute',
        right: Spacing.md,
        bottom: Spacing.md,
        backgroundColor: Colors.primary,
    },
    modal: {
        flex: 1,
        backgroundColor: Colors.white,
        marginTop: 50,
    },
})
