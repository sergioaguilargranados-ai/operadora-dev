import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
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
 * PUT /api/user/linked-travelers/[id]
 * Actualiza un viajero vinculado existente.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, email, phone, relationship, date_of_birth, passport_number, passport_expiry, nationality, gender } = body

        // Verificar pertenencia
        const existing = await queryOne('SELECT id FROM linked_travelers WHERE id = $1 AND user_id = $2', [id, userId])
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Viajero no encontrado o sin permisos' }, { status: 404 })
        }

        const updated = await queryOne(
            `UPDATE linked_travelers 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 phone = COALESCE($3, phone),
                 relationship = COALESCE($4, relationship),
                 date_of_birth = COALESCE($5, date_of_birth),
                 passport_number = COALESCE($6, passport_number),
                 passport_expiry = COALESCE($7, passport_expiry),
                 nationality = COALESCE($8, nationality),
                 gender = COALESCE($9, gender),
                 updated_at = NOW()
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            [name, email, phone, relationship, date_of_birth, passport_number, passport_expiry, nationality, gender, id, userId]
        )

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Viajero actualizado correctamente'
        })
    } catch (error: any) {
        console.error('Error PUT /api/user/linked-travelers/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/user/linked-travelers/[id]
 * Elimina (soft delete) un viajero vinculado.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = getUserIdFromRequest(request)
        if (!userId) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
        }

        const { id } = await params

        const existing = await queryOne('SELECT id FROM linked_travelers WHERE id = $1 AND user_id = $2', [id, userId])
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Viajero no encontrado o sin permisos' }, { status: 404 })
        }

        await queryOne('UPDATE linked_travelers SET is_active = false, updated_at = NOW() WHERE id = $1 AND user_id = $2', [id, userId])

        return NextResponse.json({
            success: true,
            message: 'Viajero eliminado correctamente'
        })
    } catch (error: any) {
        console.error('Error DELETE /api/user/linked-travelers/[id]:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
