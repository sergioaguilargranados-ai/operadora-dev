import { NextRequest, NextResponse } from 'next/server'
import { insertOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * Facebook OAuth Callback
 * GET /api/auth/facebook/callback
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
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const appSecret = process.env.FACEBOOK_APP_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/facebook/callback`

    if (!appId || !appSecret) {
      console.error('❌ Missing Facebook OAuth credentials')
      return NextResponse.redirect(new URL(`/login?error=config_missing`, request.url))
    }

    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`

    const tokenResponse = await fetch(tokenUrl)

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ Facebook token exchange failed:', errorData)
      return NextResponse.redirect(new URL(`/login?error=token_exchange_failed`, request.url))
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // Obtener información del usuario
    const userInfoResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`)

    if (!userInfoResponse.ok) {
      console.error('❌ Failed to fetch Facebook user info')
      return NextResponse.redirect(new URL(`/login?error=user_info_failed`, request.url))
    }

    const facebookUser = await userInfoResponse.json()

    if (!facebookUser.email) {
      // Facebook no siempre proporciona el email
      return NextResponse.redirect(new URL(`/login?error=email_required`, request.url))
    }

    // Verificar si el usuario ya existe
    const { query, queryOne } = await import('@/lib/db')
    const existingUser = await queryOne(
      'SELECT * FROM users WHERE email = $1',
      [facebookUser.email]
    )

    let userId: number

    if (existingUser) {
      userId = existingUser.id

      // Actualizar información si es necesario
      await query(
        `UPDATE users SET
          name = $1,
          facebook_id = $2,
          updated_at = NOW()
        WHERE id = $3`,
        [facebookUser.name, facebookUser.id, userId]
      )
    } else {
      // Crear nuevo usuario
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      const newUser = await insertOne('users', {
        email: facebookUser.email,
        name: facebookUser.name,
        password_hash: hashedPassword,
        facebook_id: facebookUser.id,
        profile_image: facebookUser.picture?.data?.url || null,
        email_verified: true,
        role: 'CLIENT'
      })

      userId = newUser.id
    }

    // Crear sesión
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('user_id', userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    return response

  } catch (error) {
    console.error('❌ Facebook OAuth callback error:', error)
    return NextResponse.redirect(new URL(`/login?error=server_error`, request.url))
  }
}
