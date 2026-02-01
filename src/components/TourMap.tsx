// Componente de mapa interactivo con marcadores para tours
// Build: 31 Ene 2026 - v2.257 - Google Maps JavaScript API

'use client'

import { useEffect, useRef } from 'react'

// Declaración de tipos para Google Maps
declare global {
    interface Window {
        google: any
    }
}


interface TourMapProps {
    cities: string[]
    countries: string[]
    mainCountry: string
    tourName: string
}

export function TourMap({ cities, countries, mainCountry, tourName }: TourMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const googleMapRef = useRef<any>(null)

    useEffect(() => {
        // Cargar Google Maps API
        const loadGoogleMaps = () => {
            if (typeof (window as any).google !== 'undefined') {
                initMap()
                return
            }

            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDc8NB8nvcbY2OTv6Dcvzm7AwAbV7tPgF0&libraries=places`
            script.async = true
            script.defer = true
            script.onload = () => initMap()
            document.head.appendChild(script)
        }

        const initMap = async () => {
            if (!mapRef.current) return

            const google = (window as any).google
            if (!google) return

            // Geocodificar las ciudades para obtener coordenadas
            const geocoder = new google.maps.Geocoder()
            const bounds = new google.maps.LatLngBounds()

            // Crear el mapa centrado en el país principal
            const mainLocation = await geocodeLocation(geocoder, mainCountry)

            const map = new google.maps.Map(mapRef.current, {
                zoom: 6,
                center: mainLocation,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            })

            googleMapRef.current = map

            // Agregar marcadores para cada ciudad
            const cityPromises = cities.slice(0, 10).map(async (city, index) => {
                try {
                    const location = await geocodeLocation(geocoder, `${city}, ${mainCountry}`)

                    // Crear marcador
                    const marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        title: city,
                        label: {
                            text: `${index + 1}`,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 20,
                            fillColor: '#2563eb',
                            fillOpacity: 1,
                            strokeColor: 'white',
                            strokeWeight: 3
                        }
                    })

                    // Info window
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="padding: 8px;">
                                <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937;">${city}</h3>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Parada ${index + 1} - ${tourName}</p>
                            </div>
                        `
                    })

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker)
                    })

                    bounds.extend(location)
                    return marker
                } catch (error) {
                    console.error(`Error geocoding ${city}:`, error)
                    return null
                }
            })

            await Promise.all(cityPromises)

            // Ajustar el mapa para mostrar todos los marcadores
            if (cities.length > 1) {
                map.fitBounds(bounds)
            }
        }

        const geocodeLocation = (geocoder: any, address: string): Promise<any> => {
            return new Promise((resolve, reject) => {
                geocoder.geocode({ address }, (results: any, status: any) => {
                    if (status === 'OK' && results && results[0]) {
                        resolve(results[0].geometry.location)
                    } else {
                        reject(new Error(`Geocoding failed: ${status}`))
                    }
                })
            })
        }

        loadGoogleMaps()
    }, [cities, countries, mainCountry, tourName])

    return (
        <div
            ref={mapRef}
            className="w-full h-96 rounded-xl overflow-hidden bg-gray-100"
            style={{ minHeight: '400px' }}
        />
    )
}
