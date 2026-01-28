// API para obtener configuraciones del sistema
// Build: 28 Ene 2026 - v2.237

import { NextRequest, NextResponse } from 'next/server'
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
