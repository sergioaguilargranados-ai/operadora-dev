import { NextRequest, NextResponse } from 'next/server'
import { insertOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * Google OAuth Callback
 * GET /api/auth/google/callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=oauth_cancelled`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL(`/login?error=invalid_code`, request.url))
    }

    // Intercambiar código por token de acceso
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      console.error('❌ Missing Google OAuth credentials')
      return NextResponse.redirect(new URL(`/login?error=config_missing`, request.url))
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ Google token exchange failed:', errorData)
      return NextResponse.redirect(new URL(`/login?error=token_exchange_failed`, request.url))
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // Obtener información del usuario
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error('❌ Failed to fetch Google user info')
      return NextResponse.redirect(new URL(`/login?error=user_info_failed`, request.url))
    }

    const googleUser = await userInfoResponse.json()

    // Verificar si el usuario ya existe
    const { query, queryOne } = await import('@/lib/db')
    const existingUser = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [googleUser.email]
    )

    let userId: number

    if (existingUser) {
      userId = existingUser.id

      // Actualizar información si es necesario
      await query(
        `UPDATE users SET
          name = $1,
          google_id = $2,
          updated_at = NOW()
        WHERE id = $3`,
        [googleUser.name, googleUser.id, userId]
      )
    } else {
      // Crear nuevo usuario
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      const newUser = await insertOne('users', {
        email: googleUser.email,
        name: googleUser.name,
        password_hash: hashedPassword,
        google_id: googleUser.id,
        profile_image: googleUser.picture,
        email_verified: true,
        role: 'CLIENT'
      })

      userId = newUser.id
    }

    // Crear sesión (simplificado - en producción usar JWT)
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('user_id', userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    return response

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=server_error`, request.url))
  }
}
