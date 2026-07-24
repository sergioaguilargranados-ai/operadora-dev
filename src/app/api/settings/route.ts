// API para obtener configuraciones del sistema
// Build: 23 Jul 2026 - v2.430b

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        const keys = searchParams.get('keys') // Múltiples keys separadas por coma

        if (key) {
            // Obtener un solo setting
            const result = await pool.query(
                'SELECT key, value FROM app_settings WHERE key = $1',
                [key]
            )

            if (result.rows.length === 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Setting not found'
                }, { status: 404 })
            }

            return NextResponse.json({
                success: true,
                key: result.rows[0].key,
                value: result.rows[0].value
            })
        }

        if (keys) {
            // Obtener múltiples settings
            const keyList = keys.split(',').map(k => k.trim())
            const result = await pool.query(
                `SELECT key, value FROM app_settings WHERE key = ANY($1)`,
                [keyList]
            )

            const settings: Record<string, string> = {}
            result.rows.forEach(row => {
                settings[row.key] = row.value
            })

            return NextResponse.json({
                success: true,
                settings
            })
        }

        // Obtener todos los settings
        const result = await pool.query('SELECT key, value, description FROM app_settings ORDER BY key')

        const settings: Record<string, string> = {}
        result.rows.forEach(row => {
            settings[row.key] = row.value
        })

        return NextResponse.json({
            success: true,
            settings,
            all: result.rows
        })

    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({
            success: false,
            error: 'Error fetching settings'
        }, { status: 500 })
    }
}

// PUT: Actualizar un setting
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { key, value, description } = body

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: { message: 'Se requieren key y value' } },
                { status: 400 }
            )
        }

        // Upsert en app_settings
        const result = await pool.query(`
            INSERT INTO app_settings (key, value, description, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                description = COALESCE(EXCLUDED.description, app_settings.description),
                updated_at = NOW()
            RETURNING key, value, description
        `, [key, value, description || null])

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        })
    } catch (error) {
        console.error('Error updating setting:', error)
        return NextResponse.json(
            { success: false, error: { message: 'Error al actualizar el setting' } },
            { status: 500 }
        )
    }
}
