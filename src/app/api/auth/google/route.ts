import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/google
 * Redirige dinámicamente al flujo OAuth 2.0 de Google usando credenciales del runtime.
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    const redirectUri = `${origin}/api/auth/google/callback`

    if (!clientId) {
      return NextResponse.redirect(new URL('/login?error=config_missing', request.url))
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`

    return NextResponse.redirect(googleAuthUrl)
  } catch (error) {
    console.error('❌ Error en /api/auth/google route:', error)
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}
