import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdParam = searchParams.get('tenant_id')
    
    let tenantId = 1
    if (tenantIdParam) {
      tenantId = parseInt(tenantIdParam, 10)
    }

    const result = await query(
      `SELECT * FROM mobile_app_content WHERE tenant_id = $1`,
      [tenantId]
    )

    if (result.rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      })
    }

    // Si no tiene registros específicos, devolver configuraciones por defecto
    const defaultData = {
      tenant_id: tenantId,
      welcome_phrase: '¿Listo para tu próxima experiencia?',
      logo_url: '/logo.png',
      home_banner_url: '/banner-home.jpg',
      store_banner_url: '/banner-store.jpg',
      help_phone: '+527208156804',
      help_email: 'support@asoperadora.com'
    }

    return NextResponse.json({
      success: true,
      data: defaultData
    })
  } catch (error: any) {
    console.error('[MOBILE CONTENT GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenant_id,
      welcome_phrase,
      logo_url,
      home_banner_url,
      store_banner_url,
      help_phone,
      help_email
    } = body

    const tenantId = parseInt(tenant_id, 10) || 1

    const result = await query(
      `INSERT INTO mobile_app_content (
        tenant_id, welcome_phrase, logo_url, home_banner_url, store_banner_url, help_phone, help_email, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (tenant_id)
      DO UPDATE SET
        welcome_phrase = EXCLUDED.welcome_phrase,
        logo_url = EXCLUDED.logo_url,
        home_banner_url = EXCLUDED.home_banner_url,
        store_banner_url = EXCLUDED.store_banner_url,
        help_phone = EXCLUDED.help_phone,
        help_email = EXCLUDED.help_email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        tenantId,
        welcome_phrase || '¿Listo para tu próxima experiencia?',
        logo_url || '/logo.png',
        home_banner_url || '/banner-home.jpg',
        store_banner_url || '/banner-store.jpg',
        help_phone || '+527208156804',
        help_email || 'support@asoperadora.com'
      ]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('[MOBILE CONTENT POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
