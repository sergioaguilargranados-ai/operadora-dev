import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') || 'admin@asoperadora.com'

    // Buscar usuario
    const result = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Usuario ${email} NO encontrado en BD`,
        database: await query('SELECT current_database()').then(r => r.rows[0]),
        totalUsers: await query('SELECT COUNT(*) as total FROM users').then(r => r.rows[0].total)
      })
    }

    const user = result.rows[0]

    // Probar password Password123!
    const match = await bcrypt.compare('Password123!', user.password_hash)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      passwordMatch: match,
      message: match ? '✅ Password correcto' : '❌ Password incorrecto',
      database: await query('SELECT current_database()').then(r => r.rows[0]),
      endpoint: process.env.DATABASE_URL?.match(/@([^/]+)/)?.[1] || 'unknown'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: 'ERROR'
    }, { status: 500 })
  }
}
