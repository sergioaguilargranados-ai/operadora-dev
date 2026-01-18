"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'

interface Restaurant {
    place_id: string
    name: string
    geometry: {
        location: {
            lat: number
            lng: number
        }
    }
    vicinity: string
    rating?: number
}

interface RestaurantMapProps {
    restaurants: Restaurant[]
    center?: { lat: number; lng: number }
    zoom?: number
    onMarkerClick?: (restaurant: Restaurant) => void
}

declare global {
    interface Window {
        google: any
    }
}

export function RestaurantMap({
    restaurants,
    center = { lat: 19.4326, lng: -99.1332 }, // CDMX default
    zoom = 13,
    onMarkerClick
}: RestaurantMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [map, setMap] = useState<any>(null)
    const markersRef = useRef<any[]>([])
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [loadError, setLoadError] = useState(false)

    // 1. Cargar Script de Google Maps
    useEffect(() => {
        if (window.google?.maps) {
            setScriptLoaded(true)
            return
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''

        // Intentar buscar la key de las variables de entorno inyectadas
        // Nota: Como es client-side, necesitamos que la variable empiece con NEXT_PUBLIC_
        // Opcionalmente, podemos pasarla como prop si viene del server component.

        // Si no hay key disponible en env público, intentamos leerla de una variable global o cookie si la hubiera,
        // pero lo ideal es NEXT_PUBLIC_GOOGLE_PLACES_API_KEY.

        // Fallback: Si el usuario puso GOOGLE_PLACES_API_KEY en .env pero no NEXT_PUBLIC_..., 
        // no podremos acceder a ella aquí. Asumiremos que el usuario configurará NEXT_PUBLIC_...
        // O haremos un fetch a un endpoint que nos de la configuración (más seguro pero más complejo).

        // Por simplicidad para este caso de uso:
        if (!apiKey && !document.querySelector('#google-maps-script')) {
            console.warn("Google Maps API Key not found in NEXT_PUBLIC_GOOGLE_PLACES_API_KEY")
            // Check if we can fallback to the one in .env via a server action? No.
            // We will assume for now the user keys in properly or we hardcode for testing if provided.
        }

        if (!document.querySelector('#google-maps-script')) {
            const script = document.createElement('script')
            script.id = 'google-maps-script'
            // Necesitamos la Key. Si no está en env, no cargará.
            // Usaremos una función auxiliar o asumiremos que está en env.
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
            script.async = true
            script.defer = true
            script.onload = () => setScriptLoaded(true)
            script.onerror = () => setLoadError(true)
            document.body.appendChild(script)
        } else {
            setScriptLoaded(true)
        }
    }, [])

    // 2. Inicializar Mapa
    useEffect(() => {
        if (scriptLoaded && mapRef.current && !map) {
            try {
                const newMap = new window.google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }] // Ocultar otros POIs para limpiar el mapa
                        }
                    ],
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                })
                setMap(newMap)
            } catch (e) {
                console.error("Error initializing map:", e)
            }
        }
    }, [scriptLoaded, mapRef, map, center, zoom])

    // 3. Actualizar Marcadores
    useEffect(() => {
        if (!map) return

        // Limpiar anteriores
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []

        const bounds = new window.google.maps.LatLngBounds()
        let hasValidPoints = false

        restaurants.forEach(restaurant => {
            if (!restaurant.geometry?.location) return

            const position = restaurant.geometry.location
            const marker = new window.google.maps.Marker({
                position,
                map,
                title: restaurant.name,
                animation: window.google.maps.Animation.DROP,
            })

            // InfoWindow simple
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                <div style="padding: 4px; max-width: 200px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">${restaurant.name}</h3>
                    <p style="font-size: 12px; color: #666;">${restaurant.vicinity}</p>
                    ${restaurant.rating ? `<p style="font-size: 12px; color: #f59e0b;">★ ${restaurant.rating}</p>` : ''}
                </div>
            `
            })

            marker.addListener('click', () => {
                infoWindow.open(map, marker)
                if (onMarkerClick) onMarkerClick(restaurant)
            })

            markersRef.current.push(marker)
            bounds.extend(position)
            hasValidPoints = true
        })

        if (hasValidPoints) {
            map.fitBounds(bounds)
            // Evitar zoom excesivo si hay solo 1 punto
            const listener = window.google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom() > 16) map.setZoom(16);
                window.google.maps.event.removeListener(listener);
            });
        }

    }, [map, restaurants, onMarkerClick])

    if (loadError) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-red-500 p-4 text-center">
                <p>Error al cargar Google Maps. <br /><span className="text-xs text-gray-500">Verifica tu conexión o API Key.</span></p>
            </div>
        )
    }

    if (!scriptLoaded) {
        return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <span className="animate-pulse">Cargando mapa...</span>
            </div>
        )
    }

    return (
        <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner" />
    )
}
