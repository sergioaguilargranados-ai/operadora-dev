/**
 * POST /api/auth/reset-password
 * Confirmar recuperación y cambiar contraseña
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        // Validaciones
        if (!token || typeof token !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Token requerido'
            }, { status: 400 });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return NextResponse.json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            }, { status: 400 });
        }

        // Buscar token válido
        const resetToken = await queryOne<any>(
            `SELECT 
        prt.id,
        prt.user_id,
        prt.expires_at,
        prt.used,
        u.email,
        u.name
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1
         AND prt.used = false
         AND prt.expires_at > NOW()`,
            [token]
        );

        if (!resetToken) {
            return NextResponse.json({
                success: false,
                error: 'Token inválido o expirado'
            }, { status: 400 });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar contraseña del usuario
        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, resetToken.user_id]
        );

        // Marcar token como usado
        await query(
            'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
            [resetToken.id]
        );

        // Invalidar todos los demás tokens del usuario (por seguridad)
        await query(
            `UPDATE password_reset_tokens 
       SET used = true, used_at = NOW() 
       WHERE user_id = $1 AND id != $2 AND used = false`,
            [resetToken.user_id, resetToken.id]
        );

        console.log(`✅ Contraseña actualizada para usuario: ${resetToken.email}`);

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error en reset-password:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al actualizar contraseña'
        }, { status: 500 });
    }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Verificar si un token es válido (para mostrar el formulario)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Token requerido'
            }, { status: 400 });
        }

        // Verificar si el token existe y es válido
        const resetToken = await queryOne<any>(
            `SELECT 
        prt.id,
        prt.expires_at,
        prt.used,
        u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1`,
            [token]
        );

        if (!resetToken) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: 'Token no encontrado'
            });
        }

        const now = new Date();
        const expiresAt = new Date(resetToken.expires_at);
        const isExpired = now > expiresAt;

        return NextResponse.json({
            success: true,
            valid: !resetToken.used && !isExpired,
            used: resetToken.used,
            expired: isExpired,
            email: resetToken.email // Para mostrar en el formulario
        });

    } catch (error) {
        console.error('❌ Error verificando token:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al verificar token'
        }, { status: 500 });
    }
}
