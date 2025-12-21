/**
 * Security Middleware
 * Configura headers de seguridad (CORS, CSP, HSTS, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Configurar CORS headers
 */
export function configureCORS(
  response: NextResponse,
  request: NextRequest,
  options?: {
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  }
): void {
  const {
    allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = true
  } = options || {}

  const origin = request.headers.get('origin') || ''

  // Verificar origen permitido
  const isAllowedOrigin =
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost') // Desarrollo

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || allowedOrigins[0])
  }

  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  response.headers.set('Access-Control-Max-Age', '86400') // 24 horas
}

/**
 * Configurar Content Security Policy
 */
export function configureCSP(response: NextResponse, isDevelopment: boolean = false): void {
  const cspDirectives = [
    // Scripts
    isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://*.google-analytics.com"
      : "script-src 'self' https://js.stripe.com https://www.paypal.com https://*.google-analytics.com",

    // Estilos
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Imágenes
    "img-src 'self' data: blob: https: http:",

    // Fuentes
    "font-src 'self' data: https://fonts.gstatic.com",

    // Conexiones
    "connect-src 'self' https://api.stripe.com https://*.paypal.com https://*.google-analytics.com https://*.vercel-insights.com",

    // Frames
    "frame-src 'self' https://js.stripe.com https://www.paypal.com",

    // Objetos
    "object-src 'none'",

    // Base URI
    "base-uri 'self'",

    // Form actions
    "form-action 'self' https://www.paypal.com",

    // Frame ancestors (previene clickjacking)
    "frame-ancestors 'none'",

    // Upgrade insecure requests (solo en producción)
    ...(isDevelopment ? [] : ['upgrade-insecure-requests'])
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
}

/**
 * Configurar todos los security headers
 */
export function configureSecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  options?: {
    enableCSP?: boolean
    enableCORS?: boolean
    enableHSTS?: boolean
  }
): void {
  const {
    enableCSP = true,
    enableCORS = true,
    enableHSTS = process.env.NODE_ENV === 'production'
  } = options || {}

  const isDevelopment = process.env.NODE_ENV === 'development'

  // CORS
  if (enableCORS) {
    configureCORS(response, request)
  }

  // CSP
  if (enableCSP) {
    configureCSP(response, isDevelopment)
  }

  // X-Frame-Options (previene clickjacking)
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options (previene MIME sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-XSS-Protection (protección XSS legacy)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (antes Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  )

  // HSTS (HTTP Strict Transport Security) - Solo en producción
  if (enableHSTS) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // X-Download-Options (IE)
  response.headers.set('X-Download-Options', 'noopen')

  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
}

/**
 * Middleware para aplicar security headers automáticamente
 */
export function securityMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().then(response => {
    configureSecurityHeaders(response, request)
    return response
  })
}

/**
 * Validar origen de request
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean)

  if (!origin) {
    // Permitir requests sin origin (ej: Postman, curl)
    return process.env.NODE_ENV === 'development'
  }

  return allowedOrigins.some(allowed => origin.startsWith(allowed!))
}

/**
 * Verificar si es request de OPTIONS (preflight CORS)
 */
export function isPreflightRequest(request: NextRequest): boolean {
  return request.method === 'OPTIONS'
}

/**
 * Respuesta para preflight CORS
 */
export function handlePreflightRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 })
  configureCORS(response, request)
  return response
}
