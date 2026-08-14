import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

function getUserIdFromRequest(request: NextRequest): number | null {
    try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('as_token')?.value
        if (!token) return null

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'as-operadora-secret-2026')
        return decoded.userId || decoded.id || null
    } catch {
        return null
    }
}

/**
 * GET /api/user/linked-travelers
 * Lista los compañeros de viaje / usuarios vinculados del usuario autenticado.
 */
export async function GET(request: NextRequest) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const travelers = await queryMany(
            `SELECT id, name, email, phone, relationship, date_of_birth, passport_number, passport_expiry, nationality, gender, created_at 
             FROM linked_travelers 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY created_at DESC`,
            [userId]
        )

        return NextResponse.json({
            success: true,
            data: travelers || []
        })
    } catch (error: any) {
        console.error('Error GET /api/user/linked-travelers:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/user/linked-travelers
 * Agrega un nuevo compañero de viaje vinculado.
 */
export async function POST(request: NextRequest) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, relationship, date_of_birth, passport_number, passport_expiry, nationality, gender } = body

        if (!name || name.trim() === '') {
            return NextResponse.json({ success: false, error: 'El nombre completo es obligatorio' }, { status: 400 })
        }

        const newTraveler = await queryOne(
            `INSERT INTO linked_travelers 
                (user_id, name, email, phone, relationship, date_of_birth, passport_number, passport_expiry, nationality, gender) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [
                userId,
                name.trim(),
                email?.trim() || null,
                phone?.trim() || null,
                relationship || 'family',
                date_of_birth || null,
                passport_number?.trim() || null,
                passport_expiry || null,
                nationality?.trim() || null,
                gender || null
            ]
        )

        return NextResponse.json({
            success: true,
            data: newTraveler,
            message: 'Viajero vinculado correctamente'
        })
    } catch (error: any) {
        console.error('Error POST /api/user/linked-travelers:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
