import { NextRequest, NextResponse } from 'next/server'
import { query, queryMany, insertOne } from '@/lib/db'
import jwt from 'jsonwebtoken'

/**
 * Obtener user ID desde el token JWT
 */
function getUserIdFromToken(request: NextRequest): number | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded.userId
  } catch (error) {
    return null
  }
}

/**
 * GET /api/favorites
 * Obtener todos los favoritos del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const itemType = searchParams.get('type')

    let queryText = `
      SELECT f.*,
             CASE
               WHEN f.item_type = 'hotel' THEN (SELECT row_to_json(h.*) FROM hotels h WHERE h.id = f.item_id)
               WHEN f.item_type = 'attraction' THEN (SELECT row_to_json(a.*) FROM attractions a WHERE a.id = f.item_id)
               ELSE NULL
             END as item_data
      FROM favorites f
      WHERE f.user_id = $1
    `
    const params: any[] = [userId]

    if (itemType) {
      queryText += ' AND f.item_type = $2'
      params.push(itemType)
    }

    queryText += ' ORDER BY f.created_at DESC'

    const favorites = await queryMany(queryText, params)

    return NextResponse.json({
      success: true,
      data: favorites,
      total: favorites.length
    })

  } catch (error) {
    console.error('Error getting favorites:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get favorites'
    }, { status: 500 })
  }
}

/**
 * POST /api/favorites
 * Agregar item a favoritos
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { item_type, item_id, notes } = body

    if (!item_type || !item_id) {
      return NextResponse.json({
        success: false,
        error: 'item_type and item_id are required'
      }, { status: 400 })
    }

    // Verificar si ya existe
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
      [userId, item_type, item_id]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Item already in favorites'
      }, { status: 409 })
    }

    const favorite = await insertOne('favorites', {
      user_id: userId,
      item_type,
      item_id,
      notes
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Added to favorites'
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add to favorites'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const favoriteId = searchParams.get('id')

    if (!favoriteId) {
      return NextResponse.json({
        success: false,
        error: 'id is required'
      }, { status: 400 })
    }

    const result = await query(
      'DELETE FROM favorites WHERE id = $1 AND user_id = $2',
      [parseInt(favoriteId, 10), userId]
    )

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({
        success: false,
        error: 'Favorite not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })

  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove from favorites'
    }, { status: 500 })
  }
}
