import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Detectar tenant desde el host
  const tenant = await detectTenantFromHost(host)

  // Crear response
  const response = NextResponse.next()

  // Agregar headers personalizados para usar en las APIs
  if (tenant) {
    response.headers.set('x-tenant-id', tenant.id.toString())
    response.headers.set('x-tenant-type', tenant.type)
    response.headers.set('x-tenant-name', tenant.name)
  }

  // Manejar white-label para agencias
  if (tenant?.type === 'agency') {
    // Aquí podrías agregar lógica adicional para white-label
    response.headers.set('x-white-label', 'true')
  }

  return response
}

/**
 * Detectar tenant desde el host
 */
async function detectTenantFromHost(host: string): Promise<{
  id: number
  type: string
  name: string
} | null> {
  // Remover puerto si existe
  const hostname = host.split(':')[0]

  // Si es localhost, retornar null (sin tenant específico)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  // Si es dominio principal (asoperadora.com o www.asoperadora.com)
  if (hostname === 'asoperadora.com' || hostname === 'www.asoperadora.com') {
    return null
  }

  // Si es subdomain (ej: agencia1.asoperadora.com)
  if (hostname.endsWith('.asoperadora.com')) {
    const subdomain = hostname.split('.')[0]

    // TODO: Aquí harías la consulta a la BD para obtener el tenant
    // Por ahora retornamos null, se implementará cuando conectemos la BD
    console.log('Detected subdomain:', subdomain)
    return null
  }

  // Si es dominio personalizado (ej: agenciaviajes.com)
  // TODO: Consultar en la BD si existe un tenant con este custom_domain
  console.log('Detected custom domain:', hostname)
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
