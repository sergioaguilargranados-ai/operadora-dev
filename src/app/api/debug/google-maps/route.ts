
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
        return NextResponse.json({ error: 'No API Key found', status: 'MISSING_KEY' })
    }

    try {
        // Hacemos una llamada de prueba "Text Search" simple
        const query = 'restaurantes en CDMX'
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=es`

        const response = await fetch(url)
        const data = await response.json()

        return NextResponse.json({
            status: data.status,
            error_message: data.error_message || 'None',
            result_count: data.results?.length || 0,
            full_response: data // Devolvemos la respuesta cruda de Google
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Fetch failed',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}
