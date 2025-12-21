import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      necessary_cookies = true,
      analytics_cookies = false,
      marketing_cookies = false,
      personalization_cookies = false
    } = body

    if (!session_id) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 })
    }

    // Obtener IP del usuario
    const ip_address = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       '0.0.0.0'

    const user_agent = request.headers.get('user-agent') || ''

    // Guardar consentimiento
    await query(
      `INSERT INTO cookie_consents (
        session_id, ip_address, user_agent,
        necessary_cookies, analytics_cookies, marketing_cookies, personalization_cookies,
        consent_date, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (session_id) DO UPDATE SET
        necessary_cookies = $4,
        analytics_cookies = $5,
        marketing_cookies = $6,
        personalization_cookies = $7,
        last_updated = NOW()`,
      [
        session_id,
        ip_address,
        user_agent,
        necessary_cookies,
        analytics_cookies,
        marketing_cookies,
        personalization_cookies
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Cookie consent saved'
    })
  } catch (error) {
    console.error('Error saving cookie consent:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save cookie consent',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
