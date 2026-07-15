import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId es requerido' }, { status: 400 })
    }

    const res = await query(
      "SELECT * FROM wishlist_items WHERE user_id = $1 AND status = 'saved' ORDER BY created_at DESC",
      [userId]
    )

    return NextResponse.json({ success: true, data: res.rows })
  } catch (error: any) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ success: false, error: 'Error fetching wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, item_name, item_desc, item_img, city, itinerary_id, day_index, category } = body

    if (!user_id || !item_name) {
      return NextResponse.json({ success: false, error: 'user_id y item_name son requeridos' }, { status: 400 })
    }

    // Check if it already exists to toggle it off if the user clicks again
    const existing = await query(
      "SELECT id, status FROM wishlist_items WHERE user_id = $1 AND item_name = $2 AND itinerary_id = $3",
      [user_id, item_name, itinerary_id]
    )

    if (existing.rows.length > 0) {
      const currentStatus = existing.rows[0].status
      const newStatus = currentStatus === 'saved' ? 'dismissed' : 'saved'
      await query(
        "UPDATE wishlist_items SET status = $1, created_at = CURRENT_TIMESTAMP WHERE id = $2",
        [newStatus, existing.rows[0].id]
      )
      return NextResponse.json({ success: true, action: newStatus === 'saved' ? 'added' : 'removed' })
    }

    await query(
      `INSERT INTO wishlist_items (user_id, item_name, item_desc, item_img, city, itinerary_id, day_index, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user_id, item_name, item_desc, item_img, city, itinerary_id, day_index, category || 'souvenir']
    )

    return NextResponse.json({ success: true, action: 'added' })
  } catch (error: any) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ success: false, error: 'Error adding to wishlist' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id y status son requeridos' }, { status: 400 })
    }

    await query(
      "UPDATE wishlist_items SET status = $1 WHERE id = $2",
      [status, id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating wishlist item:', error)
    return NextResponse.json({ success: false, error: 'Error updating wishlist item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 })
    }

    await query(
      "DELETE FROM wishlist_items WHERE id = $1",
      [id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting from wishlist:', error)
    return NextResponse.json({ success: false, error: 'Error deleting from wishlist' }, { status: 500 })
  }
}
