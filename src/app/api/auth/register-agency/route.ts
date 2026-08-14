import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, agencyName } = body

    // Validar datos requeridos
    if (!name || !email || !password || !agencyName) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato de correo no es válido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Este correo electrónico ya está en uso' },
        { status: 400 }
      )
    }

    // Crear el Tenant (Agencia Inactiva)
    // El tenant_type 'agency' será inactivo por defecto, y guardamos el company_name
    const tenantResult = await query(
      `INSERT INTO tenants (company_name, tenant_type, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id`,
      [agencyName, 'agency', false]
    )
    
    const tenantId = tenantResult.rows[0].id

    // Crear al Usuario con rol PENDING_AGENCY y asociarle el tenant_id
    const passwordHash = await bcrypt.hash(password, 10)

    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, phone, role, is_active, tenant_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
      [name, email, passwordHash, phone || '', 'PENDING_AGENCY', true, tenantId]
    )

    const userId = userResult.rows[0].id

    // Opcional: Notificar a super admin de nueva solicitud
    // (Podrías implementar una llamada a tu helper de correos aquí)

    // Crear sesión para que pueda entrar inmediatamente al onboarding
    const token = jwt.sign(
      {
        id: userId,
        email: email,
        role: 'PENDING_AGENCY',
        tenantId: tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({ success: true, userId, tenantId })

    // Set cookies
    response.cookies.set('as_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    response.cookies.set('as_user', encodeURIComponent(JSON.stringify({
      id: userId,
      email: email,
      role: 'PENDING_AGENCY',
      name: name
    })), {
      httpOnly: false, // Accesible desde JS frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('Error registrando agencia:', error)
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error en el servidor', details: error.message },
      { status: 500 }
    )
  }
}
