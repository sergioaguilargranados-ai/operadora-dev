import { NextRequest, NextResponse } from 'next/server'
import AuthService from '@/services/AuthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      user_type = 'cliente',
      company_name,
      company_id,
      agency_name,
      agency_id,
      corporate_role,
      agency_role,
      internal_role
    } = body

    // Validar datos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Obtener IP del usuario
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      '0.0.0.0'

    // Registrar usuario
    console.log('🔵 REGISTRO INICIADO:', { email, name })

    const result = await AuthService.register({
      name,
      email,
      password,
      phone,
      user_type,
      company_name,
      company_id,
      agency_name,
      agency_id,
      corporate_role,
      agency_role,
      internal_role
    }, ipAddress)

    console.log('✅ REGISTRO EXITOSO:', {
      userId: result.user?.id,
      email: result.user?.email
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar usuario'
    }, { status: 500 })
  }
}
