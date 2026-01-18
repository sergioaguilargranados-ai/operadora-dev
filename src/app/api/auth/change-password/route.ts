import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import bcrypt from 'bcrypt'

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, currentPassword, newPassword } = body

    // Validaciones
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Todos los campos son obligatorios'
      }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      }, { status: 400 })
    }

    // Buscar usuario
    const user = await queryOne<any>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado'
      }, { status: 404 })
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Contraseña actual incorrecta'
      }, { status: 401 })
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error: any) {
    console.error('Error changing password:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al cambiar la contraseña',
      details: error.message
    }, { status: 500 })
  }
}
