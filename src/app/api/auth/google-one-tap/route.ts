/**
 * GOOGLE ONE TAP API ENDPOINT
 * Procesa el credential de Google One Tap y autentica al usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { queryOne, query } from '@/lib/db';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return NextResponse.json({
                success: false,
                error: 'Credential requerido'
            }, { status: 400 });
        }

        // Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return NextResponse.json({
                success: false,
                error: 'Token inválido'
            }, { status: 400 });
        }

        console.log('🔵 One Tap verificado:', payload.email);

        // Buscar o crear usuario
        let user = await queryOne<any>(
            'SELECT * FROM users WHERE email = $1',
            [payload.email]
        );

        if (!user) {
            // Crear nuevo usuario
            console.log('✅ Creando nuevo usuario desde One Tap');
            const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await queryOne<any>(
                `INSERT INTO users 
                 (name, email, password_hash, email_verified, email_verified_at, avatar_url, role)
                 VALUES ($1, $2, $3, true, NOW(), $4, 'EMPLOYEE')
                 RETURNING *`,
                [
                    payload.name || 'Usuario',
                    payload.email,
                    hashedPassword,
                    payload.picture
                ]
            );
        } else {
            // Actualizar info de Google
            console.log('✅ Actualizando usuario existente');
            await query(
                `UPDATE users 
                 SET avatar_url = COALESCE($1, avatar_url),
                     email_verified = true,
                     email_verified_at = COALESCE(email_verified_at, NOW()),
                     updated_at = NOW()
                 WHERE id = $2`,
                [payload.picture, user.id]
            );
        }

        // Generar JWT para la sesión (usando JWT_SECRET del proyecto)
        const accessToken = sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'EMPLOYEE'
            },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' } // 24 horas de vigencia
        );

        // Generar refresh token (7 días)
        const refreshToken = sign(
            {
                id: user.id,
                email: user.email,
                type: 'refresh'
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Almacenar en la BD para que /api/auth/refresh lo reconozca
        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '7 days')
             ON CONFLICT (token) DO NOTHING`,
            [user.id, refreshToken]
        );

        // Crear sesión activa
        await query(
            `INSERT INTO active_sessions (user_id, session_token, expires_at, is_active)
             VALUES ($1, $2, NOW() + INTERVAL '7 days', true)`,
            [user.id, refreshToken]
        );

        return NextResponse.json({
            success: true,
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role || 'EMPLOYEE',
                phone: user.phone || '',
                memberSince: user.created_at || new Date().toISOString(),
                avatar_url: user.avatar_url || payload.picture
            },
            token: accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('❌ Error en One Tap:', error);
        return NextResponse.json({
            success: false,
            error: 'Error al procesar autenticación'
        }, { status: 500 });
    }
}
