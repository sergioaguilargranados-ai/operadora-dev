import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, Searchbar, SegmentedButtons, Card, Button } from 'react-native-paper'
import { Colors, Spacing, FontSizes } from '../../constants/theme'
import HotelMap from '../../components/HotelMap'
import { Hotel } from '../../services/hotels.service'

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('list')

    // Datos de ejemplo (en producción vendrían de una búsqueda real)
    const sampleHotels: Hotel[] = [
        {
            id: '1',
            name: 'Hotel Fiesta Americana',
            location: 'Cancún, México',
            price: 2500,
            rating: 4.5,
            image: 'https://source.unsplash.com/800x600/?hotel,luxury',
            amenities: ['WiFi', 'Piscina', 'Spa'],
            latitude: 21.1619,
            longitude: -86.8515,
        },
        {
            id: '2',
            name: 'Grand Palladium',
            location: 'Riviera Maya, México',
            price: 3200,
            rating: 4.8,
            image: 'https://source.unsplash.com/800x600/?resort,beach',
            amenities: ['Todo Incluido', 'Playa', 'Restaurantes'],
            latitude: 20.7214,
            longitude: -87.0739,
        },
        {
            id: '3',
            name: 'Hyatt Ziva',
            location: 'Cancún, México',
            price: 2800,
            rating: 4.6,
            image: 'https://source.unsplash.com/800x600/?hotel,pool',
            amenities: ['WiFi', 'Gimnasio', 'Bar'],
            latitude: 21.0877,
            longitude: -86.7750,
        },
    ]

    const handleHotelPress = (hotel: Hotel) => {
        console.log('Hotel seleccionado:', hotel.name)
        // Aquí navegarías a la pantalla de detalles del hotel
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Buscar Servicios</Text>

                <Searchbar
                    placeholder="Buscar hoteles, vuelos, autos..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                <SegmentedButtons
                    value={viewMode}
                    onValueChange={setViewMode}
                    buttons={[
                        { value: 'list', label: 'Lista', icon: 'view-list' },
                        { value: 'map', label: 'Mapa', icon: 'map' },
                    ]}
                    style={styles.segmentedButtons}
                />
            </View>

            {viewMode === 'list' ? (
                <ScrollView style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>Hoteles Destacados</Text>

                    {sampleHotels.map((hotel) => (
                        <Card key={hotel.id} style={styles.hotelCard} onPress={() => handleHotelPress(hotel)}>
                            <Card.Cover source={{ uri: hotel.image }} />
                            <Card.Content style={styles.cardContent}>
                                <Text style={styles.hotelName}>{hotel.name}</Text>
                                <Text style={styles.hotelLocation}>{hotel.location}</Text>
                                <View style={styles.cardRow}>
                                    <Text style={styles.rating}>⭐ {hotel.rating}</Text>
                                    <Text style={styles.price}>${hotel.price}/noche</Text>
                                </View>
                                <View style={styles.amenitiesContainer}>
                                    {hotel.amenities.map((amenity, index) => (
                                        <Text key={index} style={styles.amenity}>• {amenity}</Text>
                                    ))}
                                </View>
                            </Card.Content>
                            <Card.Actions>
                                <Button mode="contained">Ver Detalles</Button>
                            </Card.Actions>
                        </Card>
                    ))}
                </ScrollView>
            ) : (
                <HotelMap
                    hotels={sampleHotels}
                    onHotelPress={handleHotelPress}
                    initialRegion={{
                        latitude: 21.1619,
                        longitude: -86.8515,
                        latitudeDelta: 0.5,
                        longitudeDelta: 0.5,
                    }}
                />
            )}
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
        paddingTop: Spacing.xxl,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    searchBar: {
        marginBottom: Spacing.md,
    },
    segmentedButtons: {
        marginBottom: Spacing.sm,
    },
    listContainer: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    hotelCard: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.white,
    },
    cardContent: {
        paddingTop: Spacing.md,
    },
    hotelName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    hotelLocation: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    rating: {
        fontSize: FontSizes.sm,
        color: Colors.text,
    },
    price: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenity: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
})
