// Componente de mapa interactivo con marcadores para tours
// Build: 23 Feb 2026 - v2.326b - Robusto: try/catch global, timeout, fallback estático

'use client'

import { useEffect, useRef, useState } from 'react'

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

const GOOGLE_MAPS_API_KEY = 'AIzaSyDc8NB8nvcbY2OTv6Dcvzm7AwAbV7tPgF0'

export function TourMap({ cities, countries, mainCountry, tourName }: TourMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const googleMapRef = useRef<any>(null)
    const [mapState, setMapState] = useState<'loading' | 'interactive' | 'static' | 'text'>('loading')

    // Construir URL de Google Maps Static como fallback confiable
    const getStaticMapUrl = () => {
        const countryCtx = (mainCountry && mainCountry !== 'World')
            ? mainCountry
            : (countries?.[0] || '')
        const markers = cities.slice(0, 10).map((city, i) => {
            const label = String.fromCharCode(65 + i) // A, B, C...
            const location = countryCtx ? `${city},${countryCtx}` : city
            return `markers=color:blue%7Clabel:${label}%7C${encodeURIComponent(location)}`
        }).join('&')
        return `https://maps.googleapis.com/maps/api/staticmap?size=800x400&maptype=roadmap&${markers}&key=${GOOGLE_MAPS_API_KEY}`
    }

    // Construir URL de Google Maps embebido para abrir en nueva pestaña
    const getGoogleMapsLink = () => {
        const countryCtx = (mainCountry && mainCountry !== 'World')
            ? mainCountry
            : (countries?.[0] || '')
        const places = cities.map(c => countryCtx ? `${c}, ${countryCtx}` : c)
        if (places.length === 1) {
            return `https://www.google.com/maps/search/${encodeURIComponent(places[0])}`
        }
        // Crear un directions link con todas las ciudades
        const origin = encodeURIComponent(places[0])
        const destination = encodeURIComponent(places[places.length - 1])
        const waypoints = places.slice(1, -1).map(p => encodeURIComponent(p)).join('|')
        return `https://www.google.com/maps/dir/${origin}/${waypoints ? waypoints + '/' : ''}${destination}`
    }

    useEffect(() => {
        // Timeout de seguridad: si después de 10 segundos no cargó, ir a static
        const timeout = setTimeout(() => {
            setMapState(prev => {
                if (prev === 'loading') {
                    console.warn('⏰ TourMap: timeout, usando mapa estático')
                    return 'static'
                }
                return prev
            })
        }, 10000)

        const loadGoogleMaps = () => {
            try {
                // Verificar si ya hay un script de Google Maps cargado
                if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
                    initMap()
                    return
                }

                // Verificar si ya hay un script en proceso de carga
                const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
                if (existingScript) {
                    // Esperar a que termine de cargar
                    existingScript.addEventListener('load', () => initMap())
                    existingScript.addEventListener('error', () => {
                        console.error('❌ Google Maps script falló al cargar')
                        setMapState('static')
                    })
                    // Si ya cargó pero google no está disponible
                    setTimeout(() => {
                        if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
                            initMap()
                        }
                    }, 1000)
                    return
                }

                const script = document.createElement('script')
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
                script.async = true
                script.defer = true
                script.onload = () => initMap()
                script.onerror = () => {
                    console.error('❌ Google Maps script error')
                    setMapState('static')
                }
                document.head.appendChild(script)
            } catch (error) {
                console.error('❌ Error cargando Google Maps:', error)
                setMapState('static')
            }
        }

        const initMap = async () => {
            try {
                if (!mapRef.current) {
                    console.warn('⚠️ mapRef no disponible')
                    setMapState('static')
                    return
                }

                const google = (window as any).google
                if (!google || !google.maps) {
                    console.error('❌ Google Maps no disponible')
                    setMapState('static')
                    return
                }

                // Determinar el contexto de país para geocoding
                const countryContext = (mainCountry && mainCountry !== 'World')
                    ? mainCountry
                    : (countries && countries.length > 0 ? countries[0] : '')

                const geocoder = new google.maps.Geocoder()
                const bounds = new google.maps.LatLngBounds()

                // Centrar en el país principal
                let centerLocation = { lat: 35, lng: 136 } // Default: Japón como ejemplo
                try {
                    if (countryContext) {
                        centerLocation = await geocodeLocation(geocoder, countryContext)
                    } else if (cities.length > 0) {
                        centerLocation = await geocodeLocation(geocoder, cities[0])
                    }
                } catch {
                    console.log('ℹ️ No se pudo geocodificar centro, usando default')
                }

                const map = new google.maps.Map(mapRef.current, {
                    zoom: 5,
                    center: centerLocation,
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

                // Agregar marcadores para cada ciudad con delay entre cada uno
                // (para evitar OVER_QUERY_LIMIT)
                let markersAdded = 0
                for (let index = 0; index < Math.min(cities.length, 15); index++) {
                    const city = cities[index]
                    try {
                        // Delay entre geocoding calls para evitar rate limiting
                        if (index > 0) {
                            await new Promise(r => setTimeout(r, 200))
                        }

                        let location
                        const query = countryContext ? `${city}, ${countryContext}` : city
                        try {
                            location = await geocodeLocation(geocoder, query)
                        } catch {
                            try {
                                location = await geocodeLocation(geocoder, city)
                            } catch {
                                console.warn(`⚠️ No se pudo geocodificar: ${city}`)
                                continue
                            }
                        }

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
                        markersAdded++
                    } catch (error) {
                        console.error(`Error con marcador ${city}:`, error)
                    }
                }

                // Ajustar vista
                if (markersAdded > 1) {
                    map.fitBounds(bounds)
                } else if (markersAdded === 1) {
                    map.setZoom(8)
                }

                if (markersAdded > 0) {
                    setMapState('interactive')
                } else {
                    console.warn('⚠️ 0 marcadores, usando mapa estático')
                    setMapState('static')
                }
            } catch (error) {
                console.error('❌ Error inicializando mapa interactivo:', error)
                setMapState('static')
            }
        }

        const geocodeLocation = (geocoder: any, address: string): Promise<any> => {
            return new Promise((resolve, reject) => {
                try {
                    geocoder.geocode({ address }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                            resolve(results[0].geometry.location)
                        } else {
                            reject(new Error(`Geocoding failed for "${address}": ${status}`))
                        }
                    })
                } catch (e) {
                    reject(e)
                }
            })
        }

        loadGoogleMaps()

        return () => clearTimeout(timeout)
    }, [cities, countries, mainCountry, tourName])

    // Estado: mapa estático (fallback cuando Google Maps JS falla)
    if (mapState === 'static') {
        return (
            <div className="w-full rounded-xl overflow-hidden bg-gray-100">
                <a href={getGoogleMapsLink()} target="_blank" rel="noopener noreferrer" className="block relative group">
                    <img
                        src={getStaticMapUrl()}
                        alt={`Mapa del tour ${tourName}`}
                        className="w-full h-auto min-h-[300px] object-cover"
                        onError={() => setMapState('text')}
                    />
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-blue-600 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                        🗺️ Ver ruta completa en Google Maps
                    </div>
                </a>
            </div>
        )
    }

    // Estado: solo texto (último fallback)
    if (mapState === 'text') {
        return (
            <div className="w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🗺️</span>
                    <h3 className="font-bold text-gray-800">Ruta del tour</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {cities.map((city, i) => (
                        <span key={i} className="flex items-center gap-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                {i + 1}
                            </span>
                            <span className="text-gray-700 font-medium">{city}</span>
                            {i < cities.length - 1 && <span className="text-gray-400 mx-1">→</span>}
                        </span>
                    ))}
                </div>
                <a
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    Ver ruta en Google Maps ↗
                </a>
            </div>
        )
    }

    // Estado: cargando o mapa interactivo
    return (
        <div className="relative">
            {mapState === 'loading' && (
                <div className="absolute inset-0 z-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Cargando mapa...
                    </div>
                </div>
            )}
            <div
                ref={mapRef}
                className="w-full h-96 rounded-xl overflow-hidden bg-gray-100"
                style={{ minHeight: '400px' }}
            />
        </div>
    )
}
