import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let queryText = 'SELECT * FROM quotes WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (status) {
      queryText += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    queryText += ' ORDER BY created_at DESC'

    const result = await dbQuery(queryText, params)

    // Obtener items de cada cotización
    for (const quote of result.rows) {
      const items = await dbQuery(
        'SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order',
        [quote.id]
      )
      quote.items = items.rows
    }

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id, created_by, customer_name, customer_email, customer_phone,
      title, destination, trip_type,
      travel_start_date, travel_end_date, valid_until,
      total, notes, terms_conditions, items
    } = body

    // Crear cotización
    const quoteResult = await dbQuery(`
      INSERT INTO quotes (
        user_id, created_by, customer_name, customer_email, customer_phone,
        title, destination, trip_type,
        travel_start_date, travel_end_date, valid_until,
        total, notes, terms_conditions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'draft')
      RETURNING *
    `, [user_id, created_by, customer_name, customer_email, customer_phone, title, destination, trip_type, travel_start_date, travel_end_date, valid_until, total, notes, terms_conditions])

    const quote = quoteResult.rows[0]

    // Insertar items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        await dbQuery(`
          INSERT INTO quote_items (
            quote_id, display_order, category, item_name, description,
            quantity, unit_price, subtotal, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          quote.id, i + 1, item.category, item.item_name, item.description,
          item.quantity, item.unit_price, item.quantity * item.unit_price, item.notes
        ])
      }
    }

    // Obtener cotización completa con items
    const fullQuote = await dbQuery('SELECT * FROM quotes WHERE id = $1', [quote.id])
    const itemsResult = await dbQuery('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order', [quote.id])
    fullQuote.rows[0].items = itemsResult.rows

    return NextResponse.json({
      success: true,
      data: fullQuote.rows[0]
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, items, ...updates } = body

    // Actualizar cotización
    const fields = Object.keys(updates).filter(k => k !== 'items').map((key, i) => `${key} = $${i + 2}`).join(', ')
    const values = Object.keys(updates).filter(k => k !== 'items').map(k => updates[k])

    if (fields) {
      await dbQuery(`
        UPDATE quotes
        SET ${fields}, updated_at = NOW()
        WHERE id = $1
      `, [id, ...values])
    }

    // Actualizar items si se enviaron
    if (items) {
      // Eliminar items existentes
      await dbQuery('DELETE FROM quote_items WHERE quote_id = $1', [id])

      // Insertar nuevos items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        await dbQuery(`
          INSERT INTO quote_items (
            quote_id, display_order, category, item_name, description,
            quantity, unit_price, subtotal, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          id, i + 1, item.category, item.item_name, item.description,
          item.quantity, item.unit_price, item.quantity * item.unit_price, item.notes
        ])
      }
    }

    const result = await dbQuery('SELECT * FROM quotes WHERE id = $1', [id])
    const itemsResult = await dbQuery('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order', [id])
    result.rows[0].items = itemsResult.rows

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
