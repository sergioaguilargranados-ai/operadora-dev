import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer dev_init_secret_2025') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Crear usuarios
    const password = await bcrypt.hash('Password123!', 10)

    const users = [
      { email: 'superadmin@asoperadora.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
      { email: 'admin@asoperadora.com', name: 'Admin', role: 'ADMIN' },
      { email: 'manager@empresa.com', name: 'Manager Principal', role: 'MANAGER' },
      { email: 'maria.garcia@empresa.com', name: 'Maria Garcia', role: 'MANAGER' },
      { email: 'empleado@empresa.com', name: 'Empleado Uno', role: 'EMPLOYEE' },
      { email: 'juan.perez@empresa.com', name: 'Juan Perez', role: 'EMPLOYEE' },
    ]

    for (const user of users) {
      await query(
        `INSERT INTO users (email, password_hash, full_name, role, is_verified, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.email, password, user.name, user.role]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuarios creados. Password: Password123!',
      users: users.map(u => u.email)
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
