import { NextResponse } from 'next/server'

// MOCK DATA para cuando no hay API Key o para pruebas
const MOCK_RESTAURANTS = [
    {
        place_id: "mock-1",
        name: "La Bella Italia",
        photos: [{ photo_reference: "mock_photo_1" }],
        rating: 4.8,
        user_ratings_total: 1250,
        price_level: 2,
        vicinity: "Av. Reforma 123, Ciudad de México",
        geometry: { location: { lat: 19.4326, lng: -99.1332 } },
        opening_hours: { open_now: true },
        types: ["restaurant", "food", "point_of_interest", "establishment"],
        cuisine: ["Italiana", "Pizza", "Romántico"] // Campo enriquecido manualmente en el mock
    },
    {
        place_id: "mock-2",
        name: "El Tizoncito",
        photos: [{ photo_reference: "mock_photo_2" }],
        rating: 4.5,
        user_ratings_total: 3200,
        price_level: 1,
        vicinity: "Condesa, Ciudad de México",
        geometry: { location: { lat: 19.4126, lng: -99.1732 } },
        opening_hours: { open_now: true },
        types: ["restaurant", "food"],
        cuisine: ["Mexicana", "Tacos", "Casual"]
    },
    {
        place_id: "mock-3",
        name: "Suntory Lomas",
        photos: [{ photo_reference: "mock_photo_3" }],
        rating: 4.9,
        user_ratings_total: 850,
        price_level: 4,
        vicinity: "Lomas de Chapultepec, Ciudad de México",
        geometry: { location: { lat: 19.4226, lng: -99.2032 } },
        opening_hours: { open_now: false },
        types: ["restaurant", "food"],
        cuisine: ["Japonesa", "Sushi", "Alta cocina", "Romántico"]
    },
    {
        place_id: "mock-4",
        name: "Sonora Grill Prime",
        photos: [{ photo_reference: "mock_photo_4" }],
        rating: 4.7,
        user_ratings_total: 2100,
        price_level: 3,
        vicinity: "Polanco, Ciudad de México",
        geometry: { location: { lat: 19.4350, lng: -99.1950 } },
        opening_hours: { open_now: true },
        types: ["restaurant", "food"],
        cuisine: ["Filete", "Americana", "Grupos"]
    },
    {
        place_id: "mock-5",
        name: "Fisher's",
        photos: [{ photo_reference: "mock_photo_5" }],
        rating: 4.6,
        user_ratings_total: 4500,
        price_level: 2,
        vicinity: "Roma Norte, Ciudad de México",
        geometry: { location: { lat: 19.4180, lng: -99.1630 } },
        opening_hours: { open_now: true },
        types: ["restaurant", "food"],
        cuisine: ["A base de mariscos", "Divertido", "Casual", "Cumpleaños"]
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || searchParams.get('city') // Support 'city' param too

    // API KEY del servidor (segura)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    // Log para depuración
    console.log(`[API Restaurants] Search Query: ${query}`)
    console.log(`[API Restaurants] API Key configured: ${!!apiKey}`)

    // Si no hay API Key, advertimos pero intentamos fallback a mock solo si es explícito el modo test
    if (!apiKey) {
        console.error("❌ FALTA API KEY: GOOGLE_PLACES_API_KEY no está definida en .env.local")
        return NextResponse.json({
            error: "Configuración de servidor incompleta (Falta API Key)",
            source: "ERROR"
        }, { status: 500 })
    }

    try {
        // 1. Text Search (Búsqueda por texto)
        const searchText = query ? `restaurantes en ${query}` : 'restaurantes populares'
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&key=${apiKey}&language=es`

        // Log URL (sin key)
        console.log(`[API Restaurants] Fetching from Google: ${url.replace(apiKey, 'HIDDEN_KEY')}`)

        const response = await fetch(url)
        const data = await response.json()

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API Error:', data)
            throw new Error(data.error_message || `API Error: ${data.status}`)
        }

        // Mapear resultados al formato de nuestra app
        // Nota: TextSearch devuelve geometry, name, photos, price_level, rating, user_ratings_total
        const results = (data.results || []).map((place: any) => ({
            place_id: place.place_id,
            name: place.name,
            photos: place.photos,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            vicinity: place.formatted_address, // TextSearch devuelve formatted_address
            geometry: place.geometry,
            opening_hours: place.opening_hours,
            types: place.types,
            // Enriquecimiento manual simple para cuisine si no viene explícito
            cuisine: place.types
        }))

        console.log(`[API Restaurants] Found ${results.length} results`)

        return NextResponse.json({
            results: results,
            status: "OK",
            source: "GOOGLE"
        })

    } catch (error) {
        console.error('Error en API de Restaurantes:', error)
        return NextResponse.json(
            { error: 'Error al buscar restaurantes', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
