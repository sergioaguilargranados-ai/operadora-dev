import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware de Next.js para Multi-Empresa / Marca Blanca + Protección de Rutas
 * 
 * NOTA: Este middleware corre en Edge Runtime, NO puede importar pg/TenantService.
 * La detección real se hace vía /api/tenant/detect (Node.js runtime).
 * Aquí solo extraemos subdomain/host y lo pasamos como header para que
 * el frontend o las APIs lo usen.
 * 
 * Sprint 6: Añade protección server-side de rutas por rol.
 */

// ═══════════════════════════════════════
// Rutas protegidas por rol
// ═══════════════════════════════════════
interface RouteRule {
  path: string
  roles: string[]      // roles permitidos
  requireAuth: boolean
}

const PROTECTED_ROUTES: RouteRule[] = [
  // Super Admin
  { path: '/dashboard/admin', roles: ['SUPER_ADMIN'], requireAuth: true },
  // Agency Admin
  { path: '/dashboard/agency', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN'], requireAuth: true },
  // Agent
  { path: '/dashboard/agent', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT'], requireAuth: true },
  // RRHH - Solo HR Manager, Agency Admin y Super Admin
  { path: '/dashboard/rrhh', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'HR_MANAGER'], requireAuth: true },
  // CRM - Agentes y admins
  { path: '/dashboard/crm', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'HR_MANAGER'], requireAuth: true },
  // Dashboard general - cualquier usuario autenticado
  { path: '/dashboard/payments', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'CLIENT', 'admin', 'user', 'HR_MANAGER'], requireAuth: true },
  { path: '/dashboard/corporate', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'CLIENT', 'admin', 'user', 'HR_MANAGER'], requireAuth: true },
  { path: '/dashboard', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'CLIENT', 'admin', 'user', 'HR_MANAGER'], requireAuth: true },
  // Mis reservas
  { path: '/mis-reservas', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'AGENT', 'CLIENT', 'admin', 'user'], requireAuth: true },
  // Aprobaciones
  { path: '/approvals', roles: ['SUPER_ADMIN', 'AGENCY_ADMIN', 'admin'], requireAuth: true },
]

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl

  // Crear response
  let response = NextResponse.next()

  // ─────────────────────────────────────────────
  // 1. Detectar subdomain o dominio personalizado
  // ─────────────────────────────────────────────
  const tenantInfo = extractTenantFromHost(host)

  if (tenantInfo) {
    // Pasar info al frontend/APIs vía headers
    response.headers.set('x-tenant-host', host)
    response.headers.set('x-tenant-subdomain', tenantInfo.subdomain || '')
    response.headers.set('x-tenant-custom-domain', tenantInfo.customDomain || '')
    response.headers.set('x-white-label', 'true')

    // ── Pre-fetch tenant config con cache ──
    // Solo en páginas (no en assets estáticos)
    if (!pathname.includes('.') && !pathname.startsWith('/_next')) {
      const cachedConfig = tenantConfigCache.get(tenantInfo.subdomain || tenantInfo.customDomain || '')

      if (cachedConfig && cachedConfig.expiresAt > Date.now()) {
        // Usar config cacheada → pasar via cookie para que WhiteLabelContext la lea
        response.cookies.set('x-tenant-config', JSON.stringify(cachedConfig.data), {
          maxAge: 300, // 5 min
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
        })
      } else {
        // Fetch desde API interna al detect endpoint
        try {
          const detectParam = tenantInfo.subdomain
            ? `subdomain=${tenantInfo.subdomain}`
            : `host=${encodeURIComponent(tenantInfo.customDomain || host)}`

          const origin = url.origin
          const detectRes = await fetch(`${origin}/api/tenant/detect?${detectParam}`, {
            headers: { 'x-internal-middleware': '1' },
          })

          if (detectRes.ok) {
            const detectData = await detectRes.json()
            if (detectData.success && detectData.data) {
              // Cachear en Edge por 5 minutos
              const cacheKey = tenantInfo.subdomain || tenantInfo.customDomain || ''
              tenantConfigCache.set(cacheKey, {
                data: detectData.data,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
              })

              // Pasar config via cookie
              response.cookies.set('x-tenant-config', JSON.stringify(detectData.data), {
                maxAge: 300,
                path: '/',
                httpOnly: false,
                sameSite: 'lax',
              })
            }
          }
        } catch (fetchErr) {
          // Si falla el fetch, el WhiteLabelContext hará su propio fetch client-side
          console.warn('⚠️ Middleware: Failed to pre-fetch tenant config:', fetchErr)
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // 2. Detectar referral code (?r=CODIGO)
  // ─────────────────────────────────────────────
  const referralCode = url.searchParams.get('r')
  if (referralCode) {
    // Guardar referral en cookie (30 días)
    response.cookies.set('as_referral', referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/',
      httpOnly: false, // Frontend necesita leerla
      sameSite: 'lax',
    })
    response.headers.set('x-referral-code', referralCode)
  } else {
    // Verificar si ya existe cookie de referral
    const existingReferral = request.cookies.get('as_referral')?.value
    if (existingReferral) {
      response.headers.set('x-referral-code', existingReferral)
    }
  }

  // ─────────────────────────────────────────────
  // 3. Protección de rutas por rol (Sprint 6)
  // ─────────────────────────────────────────────
  const matchedRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r.path))

  if (matchedRoute && matchedRoute.requireAuth) {
    const userPayload = extractUserFromToken(request)

    if (!userPayload) {
      // No autenticado → redirigir a login con returnUrl
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar rol
    const userRole = (userPayload.role || 'CLIENT').toUpperCase()
    const hasAccess = matchedRoute.roles.some(r =>
      r.toUpperCase() === userRole ||
      // user_id = 1 siempre es super admin
      userPayload.id === 1
    )

    if (!hasAccess) {
      // Sin permisos → redirigir a dashboard base con mensaje
      const dashUrl = new URL('/dashboard', request.url)
      dashUrl.searchParams.set('access_denied', '1')
      dashUrl.searchParams.set('required_role', matchedRoute.roles.join(','))
      return NextResponse.redirect(dashUrl)
    }

    // Pasar info de usuario a la respuesta
    response.headers.set('x-user-id', String(userPayload.id))
    response.headers.set('x-user-role', userPayload.role || 'CLIENT')
    response.headers.set('x-user-email', userPayload.email || '')
  }

  return response
}

// ═══════════════════════════════════════
// Cache en-Edge para config de tenants
// Se limpia cada vez que el Edge Worker se recicla (cada pocos minutos en Vercel)
// ═══════════════════════════════════════
const tenantConfigCache = new Map<string, { data: any; expiresAt: number }>()

/**
 * Intenta extraer el payload del JWT desde cookies o localStorage backup.
 * Edge Runtime NO puede usar jsonwebtoken, así que solo decodificamos el payload base64.
 * La verificación real de firma se hace en las APIs (Node.js runtime).
 */
function extractUserFromToken(request: NextRequest): { id: number; email: string; role: string } | null {
  // Intentar obtener token de cookie
  const token = request.cookies.get('as_token')?.value

  // También buscar en header Authorization
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const jwt = token || bearerToken

  if (!jwt) {
    // Intentar ver si hay cookie as_user (fallback para nuestro sistema basado en localStorage)
    const userCookie = request.cookies.get('as_user')?.value
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie)
        return {
          id: parseInt(user.id) || 0,
          email: user.email || '',
          role: user.role || 'CLIENT'
        }
      } catch { return null }
    }
    return null
  }

  try {
    // Decodificar JWT payload (sin verificar firma, eso se hace en APIs)
    const parts = jwt.split('.')
    if (parts.length !== 3) return null

    // Base64url decode del payload
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(decoded)

    // Verificar expiración
    if (data.exp && Date.now() / 1000 > data.exp) {
      return null // Token expirado
    }

    return {
      id: data.id || data.userId || 0,
      email: data.email || '',
      role: data.role || data.user_type || 'CLIENT'
    }
  } catch {
    return null
  }
}

/**
 * Extrae información de tenant desde el hostname
 */
function extractTenantFromHost(host: string): {
  subdomain: string | null
  customDomain: string | null
} | null {
  // Remover puerto si existe
  const hostname = host.split(':')[0]

  // Si es localhost, no hay tenant
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  // Dominios principales de AS Operadora (sin tenant)
  const mainDomains = [
    'asoperadora.com',
    'www.asoperadora.com',
    'app.asoperadora.com',
    'as-ope-viajes.company',
    'www.as-ope-viajes.company',
  ]

  if (mainDomains.includes(hostname)) {
    return null
  }

  // Verificar si es subdominio de asoperadora.com o app.asoperadora.com
  // Ejemplos: mmta.app.asoperadora.com, agencia1.asoperadora.com
  const baseDomains = [
    '.app.asoperadora.com',    // mmta.app.asoperadora.com
    '.app-asoperadora.com',    // mmta.app-asoperadora.com  
    '.asoperadora.com',        // agencia1.asoperadora.com
  ]

  for (const baseDomain of baseDomains) {
    if (hostname.endsWith(baseDomain)) {
      const subdomain = hostname.replace(baseDomain, '')
      if (subdomain && !subdomain.includes('.')) {
        return { subdomain, customDomain: null }
      }
    }
  }

  // Si no es ningún dominio conocido de AS Operadora, 
  // podría ser un dominio personalizado de agencia
  if (!hostname.includes('asoperadora') && !hostname.includes('vercel')) {
    return { subdomain: null, customDomain: hostname }
  }

  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
