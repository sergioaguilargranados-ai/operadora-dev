
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
        return NextResponse.json({ error: 'No API Key found', status: 'MISSING_KEY' })
    }

    try {
        // v1 New API Test
        const query = 'restaurantes en CDMX'
        const url = 'https://places.googleapis.com/v1/places:searchText'

        const requestBody = {
            textQuery: query,
            languageCode: 'es',
            maxResultCount: 5
        }

        const fieldMask = 'places.displayName,places.formattedAddress,places.priceLevel'

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': fieldMask
            },
            body: JSON.stringify(requestBody)
        })

        const data = await response.json()

        return NextResponse.json({
            endpoint: 'places.googleapis.com/v1/places:searchText',
            status_code: response.status,
            ok: response.ok,
            result_count: data.places?.length || 0,
            full_response: data // Raw google response
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Fetch failed',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}
