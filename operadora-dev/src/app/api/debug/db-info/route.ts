import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Obtener info de BD
    const dbName = await query('SELECT current_database() as db')
    const host = await query('SELECT inet_server_addr() as host')
    const userCount = await query('SELECT COUNT(*) as total FROM users')
    const lastUser = await query(`
      SELECT email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 1
    `)

    // Connection string sin password
    const connStr = process.env.DATABASE_URL || ''
    const safeConnStr = connStr.replace(/:[^@]+@/, ':***@')

    return NextResponse.json({
      success: true,
      database: dbName.rows[0]?.db || 'unknown',
      host: host.rows[0]?.host || 'unknown',
      totalUsers: userCount.rows[0]?.total || 0,
      lastUser: lastUser.rows[0] || null,
      connectionString: safeConnStr,
      endpoint: safeConnStr.match(/@([^/]+)/)?.[1] || 'unknown'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
