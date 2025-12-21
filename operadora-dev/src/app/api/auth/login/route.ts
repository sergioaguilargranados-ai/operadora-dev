import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
const bcrypt = require('bcryptjs');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[LOGIN] Intento:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('[LOGIN] Usuario encontrado:', result.rows.length > 0);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // ✅ VALIDAR que el usuario tenga contraseña configurada
    if (!user.password_hash || user.password_hash === '') {
      console.log('[LOGIN] Usuario sin contraseña configurada');
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario sin contraseña configurada. Contacta al administrador.'
        },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    console.log('[LOGIN] Password match:', passwordMatch);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Retornar usuario (sin password)
    const { password_hash: _, ...userData } = user;

    console.log('[LOGIN] Éxito');

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error: any) {
    console.error('[LOGIN] Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Error: ' + error.message },
      { status: 500 }
    );
  }
}
