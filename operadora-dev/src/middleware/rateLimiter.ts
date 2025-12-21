/**
 * Rate Limiter Middleware
 * Protege APIs de abuso limitando el número de requests por IP/usuario
 */

import { NextRequest, NextResponse } from 'next/server'

// Almacenamiento en memoria (en producción usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests en la ventana
  message?: string
  skipSuccessfulRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
}

/**
 * Crear rate limiter
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => getClientIdentifier(req)
  } = config

  return async function rateLimiterMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(request)
    const now = Date.now()

    // Limpiar entradas expiradas
    cleanupExpiredEntries()

    // Obtener o crear contador
    let record = requestCounts.get(key)

    if (!record || now > record.resetTime) {
      // Nueva ventana
      record = {
        count: 1,
        resetTime: now + windowMs
      }
      requestCounts.set(key, record)
    } else {
      // Incrementar contador
      record.count++
    }

    // Verificar límite
    if (record.count > maxRequests) {
      const resetInSeconds = Math.ceil((record.resetTime - now) / 1000)

      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter: resetInSeconds
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetInSeconds.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
          }
        }
      )
    }

    // Ejecutar handler
    const response = await handler()

    // Agregar headers de rate limit
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (maxRequests - record.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

    return response
  }
}

/**
 * Obtener identificador de cliente (IP o user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Intentar obtener IP real
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') ||
             'unknown'

  // TODO: Si hay autenticación, usar user ID
  // const userId = request.headers.get('x-user-id')
  // return userId || ip

  return ip
}

/**
 * Limpiar entradas expiradas (ejecutar periódicamente)
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  const keysToDelete: string[] = []

  requestCounts.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach(key => requestCounts.delete(key))
}

// Limpiar cada 5 minutos
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

/**
 * Rate limiters predefinidos
 */

// Límite estricto para APIs sensibles (login, registro, pagos)
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
  message: 'Demasiados intentos. Espera 15 minutos.'
})

// Límite moderado para APIs de autenticación
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10,
  message: 'Demasiados intentos de autenticación. Espera 15 minutos.'
})

// Límite general para APIs públicas
export const generalRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 100,
  message: 'Demasiadas solicitudes. Espera un momento.'
})

// Límite para búsquedas
export const searchRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 30,
  message: 'Demasiadas búsquedas. Espera un momento.'
})

// Límite para uploads
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 10,
  message: 'Límite de uploads alcanzado. Espera una hora.'
})

/**
 * Uso en APIs:
 *
 * export async function POST(request: NextRequest) {
 *   return strictRateLimiter(request, async () => {
 *     // Tu lógica de API aquí
 *     return NextResponse.json({ success: true })
 *   })
 * }
 */
