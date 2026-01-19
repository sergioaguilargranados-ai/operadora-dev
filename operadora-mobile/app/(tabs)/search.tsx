import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { Text, TextInput, Button, SegmentedButtons, HelperText, useTheme } from 'react-native-paper'
import { useState } from 'react'
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

type SearchType = 'hotels' | 'flights' | 'autos' | 'tours'

export default function SearchScreen() {
    const [searchType, setSearchType] = useState<SearchType>('hotels')
    const theme = useTheme()

    // Form States - Hotels
    const [destination, setDestination] = useState('')
    const [dates, setDates] = useState('')
    const [guests, setGuests] = useState('2 Adultos')

    // Form States - Flights
    const [origin, setOrigin] = useState('')
    const [flightDestination, setFlightDestination] = useState('')
    const [flightDates, setFlightDates] = useState('')

    const handleSearch = () => {
        // Navigate to results with search params
        router.push({
            pathname: '/search-results',
            params: {
                type: searchType,
                destination: searchType === 'hotels' ? destination : flightDestination,
                dates: searchType === 'hotels' ? dates : flightDates
            }
        })
    }

    const renderHotelForm = () => (
        <View style={styles.formContainer}>
            <TextInput
                label="¿A dónde vas?"
                value={destination}
                onChangeText={setDestination}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
            />

            <TextInput
                label="Fechas (Ej: 20 Ene - 25 Ene)"
                value={dates}
                onChangeText={setDates}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
            />

            <TextInput
                label="Huéspedes"
                value={guests}
                onChangeText={setGuests}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account-group" />}
            />
        </View>
    )

    const renderFlightForm = () => (
        <View style={styles.formContainer}>
            <TextInput
                label="Origen (Ej: CDMX)"
                value={origin}
                onChangeText={setOrigin}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="airplane-takeoff" />}
            />

            <TextInput
                label="Destino (Ej: Cancún)"
                value={flightDestination}
                onChangeText={setFlightDestination}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="airplane-landing" />}
            />

            <TextInput
                label="Fechas de Viaje"
                value={flightDates}
                onChangeText={setFlightDates}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
            />
        </View>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Buscar Viaje</Text>

                <SegmentedButtons
                    value={searchType}
                    onValueChange={(val) => setSearchType(val as SearchType)}
                    buttons={[
                        {
                            value: 'hotels',
                            label: 'Hoteles',
                            icon: 'bed',
                        },
                        {
                            value: 'flights',
                            label: 'Vuelos',
                            icon: 'airplane',
                        },
                        {
                            value: 'autos',
                            label: 'Autos',
                            icon: 'car',
                        },
                    ]}
                    style={styles.tabs}
                />

                <View style={styles.card}>
                    {searchType === 'hotels' && renderHotelForm()}
                    {searchType === 'flights' && renderFlightForm()}
                    {searchType === 'autos' && (
                        <View style={styles.placeholderContainer}>
                            <Text>Búsqueda de autos próximamente</Text>
                        </View>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleSearch}
                        style={styles.searchButton}
                        contentStyle={styles.searchButtonContent}
                        labelStyle={styles.searchButtonLabel}
                    >
                        Buscar {searchType === 'hotels' ? 'Hoteles' : searchType === 'flights' ? 'Vuelos' : 'Autos'}
                    </Button>
                </View>

            </ScrollView>
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
    },
    contentContainer: {
        padding: Spacing.md,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.lg,
        marginTop: Spacing.sm,
    },
    tabs: {
        marginBottom: Spacing.lg,
    },
    card: {
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    formContainer: {
        marginBottom: Spacing.md,
    },
    input: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
    },
    placeholderContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    searchButton: {
        marginTop: Spacing.sm,
        backgroundColor: Colors.secondary,
        borderRadius: BorderRadius.full,
    },
    searchButtonContent: {
        paddingVertical: Spacing.xs,
    },
    searchButtonLabel: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
})
