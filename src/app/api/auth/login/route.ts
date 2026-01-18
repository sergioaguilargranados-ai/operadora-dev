import { NextRequest, NextResponse } from 'next/server'
import AuthService from '@/services/AuthService'
import { successResponse, errorResponse } from '@/types/api-response'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const ipLimiter = new RateLimiterMemory({ points: 5, duration: 60 }) // 5 req/min por IP
const deviceLimiter = new RateLimiterMemory({ points: 10, duration: 60 }) // 10 req/min por device

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, device_fingerprint } = body || {}

    if (!email || !password) {
      return NextResponse.json(
        errorResponse('AUTH_MISSING', 'Email y contraseña requeridos'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0').split(',')[0].trim()
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting por IP
    try {
      await ipLimiter.consume(ip)
    } catch {
      return NextResponse.json(
        errorResponse('RATE_LIMIT_IP', 'Demasiados intentos desde tu IP. Intenta nuevamente en 1 minuto.'),
        { status: 429, headers: { 'Retry-After': '60', 'X-API-Version': '1.0' } }
      )
    }

    // Rate limiting por device
    if (device_fingerprint) {
      try {
        await deviceLimiter.consume(device_fingerprint)
      } catch {
        return NextResponse.json(
          errorResponse('RATE_LIMIT_DEVICE', 'Demasiados intentos desde tu dispositivo. Intenta nuevamente en 1 minuto.'),
          { status: 429, headers: { 'Retry-After': '60', 'X-API-Version': '1.0' } }
        )
      }
    }

    const result = await AuthService.login({
      email,
      password,
      device_fingerprint,
      ip_address: ip,
      user_agent: userAgent,
    })

    const responseBody = {
      ...successResponse({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        permissions: result.permissions,
      }),
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }

    return NextResponse.json(responseBody, { status: 200, headers: { 'X-API-Version': '1.0' } })
  } catch (error: any) {
    const message = error?.message || 'Credenciales inválidas'
    const status = message.includes('inválidas') ? 401 : 500
    return NextResponse.json(
      errorResponse('AUTH_INVALID', message),
      { status, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
