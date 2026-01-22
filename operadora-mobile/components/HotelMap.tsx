import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions, Platform } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps'
import { Text, Card, Button } from 'react-native-paper'
import * as Location from 'expo-location'
import { Colors, Spacing, FontSizes } from '../constants/theme'

interface Hotel {
    id: string
    name: string
    location: string
    price: number
    rating: number
    latitude?: number
    longitude?: number
}

interface HotelMapProps {
    hotels: Hotel[]
    onHotelPress?: (hotel: Hotel) => void
    initialRegion?: Region
}

export default function HotelMap({ hotels, onHotelPress, initialRegion }: HotelMapProps) {
    const [region, setRegion] = useState<Region>(
        initialRegion || {
            latitude: 19.4326, // Ciudad de México por defecto
            longitude: -99.1332,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        }
    )
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    useEffect(() => {
        getUserLocation()
    }, [])

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                console.log('Permission to access location was denied')
                return
            }

            const location = await Location.getCurrentPositionAsync({})
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            })

            // Si no hay región inicial, centrar en ubicación del usuario
            if (!initialRegion) {
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                })
            }
        } catch (error) {
            console.error('Error getting user location:', error)
        }
    }

    const handleMarkerPress = (hotel: Hotel) => {
        if (onHotelPress) {
            onHotelPress(hotel)
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
            >
                {/* Marcador de ubicación del usuario */}
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="Mi ubicación"
                        pinColor={Colors.primary}
                    />
                )}

                {/* Marcadores de hoteles */}
                {hotels.map((hotel) => {
                    // Si el hotel tiene coordenadas, usarlas
                    // Si no, generar coordenadas aleatorias cerca de la región (para demo)
                    const latitude = hotel.latitude || region.latitude + (Math.random() - 0.5) * 0.05
                    const longitude = hotel.longitude || region.longitude + (Math.random() - 0.5) * 0.05

                    return (
                        <Marker
                            key={hotel.id}
                            coordinate={{ latitude, longitude }}
                            onPress={() => handleMarkerPress(hotel)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.priceMarker}>
                                    <Text style={styles.priceText}>${hotel.price}</Text>
                                </View>
                            </View>

                            <Callout tooltip onPress={() => handleMarkerPress(hotel)}>
                                <Card style={styles.calloutCard}>
                                    <Card.Content>
                                        <Text style={styles.hotelName}>{hotel.name}</Text>
                                        <Text style={styles.hotelLocation}>{hotel.location}</Text>
                                        <View style={styles.calloutRow}>
                                            <Text style={styles.rating}>⭐ {hotel.rating}</Text>
                                            <Text style={styles.price}>${hotel.price}/noche</Text>
                                        </View>
                                        <Button
                                            mode="contained"
                                            compact
                                            style={styles.viewButton}
                                            onPress={() => handleMarkerPress(hotel)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </Card.Content>
                                </Card>
                            </Callout>
                        </Marker>
                    )
                })}
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    markerContainer: {
        alignItems: 'center',
    },
    priceMarker: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.white,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    priceText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: FontSizes.sm,
    },
    calloutCard: {
        width: 250,
        borderRadius: 8,
    },
    hotelName: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    hotelLocation: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    calloutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
    viewButton: {
        marginTop: 4,
    },
})
