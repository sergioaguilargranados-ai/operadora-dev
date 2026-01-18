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
    const query = searchParams.get('query')
    // Buscar en variables de entorno estándar (Server) o públicas (Client/Server)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    // Si no hay API Key o es una búsqueda de prueba específica, devolvemos Mocks
    if (!apiKey || query?.toLowerCase().includes('demo') || query?.toLowerCase().includes('mock')) {
        console.log("⚠️ Usando MOCK DATA para Restaurantes (Sin API Key o modo demo)")

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Filtrado básico del mock por texto
        let results = MOCK_RESTAURANTS;
        if (query && !query.includes('demo')) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(r =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.cuisine.some(c => c.toLowerCase().includes(lowerQuery)) ||
                r.vicinity.toLowerCase().includes(lowerQuery)
            );
        }

        return NextResponse.json({
            results: results,
            status: "OK",
            source: "MOCK"
        })
    }

    try {
        // 1. Text Search (Búsqueda por texto: "Restaurantes en [Ciudad/Zona] [Tipo]")
        // https://maps.googleapis.com/maps/api/place/textsearch/json
        const searchText = `restaurantes en ${query}`
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&key=${apiKey}&language=es`
        )
        const data = await response.json()

        if (data.status !== 'OK') {
            console.error('Google Places API Error:', data)
            throw new Error(data.error_message || 'Error fetching places')
        }

        // En un escenario real, aquí podríamos enriquecer los resultados llamando a Place Details si hiciera falta,
        // pero Text Search ya devuelve lo básico necesario.

        return NextResponse.json({
            results: data.results,
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
