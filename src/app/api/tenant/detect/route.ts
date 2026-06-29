import { NextRequest, NextResponse } from 'next/server'
import TenantService from '@/services/TenantService'

/**
 * GET /api/tenant/detect
 * Detectar tenant actual desde:
 *  1. Header x-tenant-host (enviado por middleware)
 *  2. Query param ?host=xxx
 *  3. Query param ?subdomain=xxx
 *  4. Query param ?domain=xxx
 * 
 * Retorna: { tenant, whiteLabelConfig } o null
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Prioridad 1: host enviado por middleware via header
        const tenantHost = request.headers.get('x-tenant-host') || ''

        // Prioridad 2: query params explícitos
        const hostParam = searchParams.get('host')
        const subdomainParam = searchParams.get('subdomain')
        const domainParam = searchParams.get('domain')

        let tenant = null

        // Intentar detección por subdomain directo
        if (subdomainParam) {
            tenant = await TenantService.getTenantBySubdomain(subdomainParam)
        }

        // Intentar detección por dominio custom directo
        if (!tenant && domainParam) {
            tenant = await TenantService.getTenantByDomain(domainParam)
        }

        // Intentar detección automática por host (middleware o param)
        if (!tenant) {
            const host = hostParam || tenantHost
            if (host) {
                tenant = await TenantService.detectTenant(host)
            }
        }

        // Si no se encontró tenant
        if (!tenant) {
            return NextResponse.json({
                success: true,
                data: null,
                message: 'No tenant detected — using default (AS Operadora)'
            })
        }

        // Obtener configuración white-label si es agencia
        let whiteLabelConfig = null
        let logo_mobile_url = null
        if (tenant.tenant_type === 'agency') {
            whiteLabelConfig = await TenantService.getWhiteLabelConfig(tenant.id)
            try {
                const { db } = await import('@/lib/db');
                const mobileRes = await db.query('SELECT logo_url FROM mobile_app_content WHERE tenant_id = $1', [tenant.id]);
                if (mobileRes.rows.length > 0) {
                    logo_mobile_url = mobileRes.rows[0].logo_url;
                }
            } catch (e) {
                console.error("Error fetching mobile logo:", e);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                tenant: {
                    id: tenant.id,
                    tenant_type: tenant.tenant_type,
                    company_name: tenant.company_name,
                    logo_url: tenant.logo_url,
                    logo_mobile_url: logo_mobile_url || (tenant as any).logo_mobile_url,
                    logo_dark_url: (tenant as any).logo_dark_url,
                    primary_color: tenant.primary_color,
                    secondary_color: tenant.secondary_color,
                    accent_color: tenant.accent_color,
                    custom_domain: tenant.custom_domain,
                    email: tenant.email,
                    phone: tenant.phone,
                    is_active: tenant.is_active
                },
                whiteLabelConfig: whiteLabelConfig ? {
                    favicon_url: whiteLabelConfig.favicon_url,
                    footer_text: whiteLabelConfig.footer_text,
                    support_email: whiteLabelConfig.support_email,
                    support_phone: whiteLabelConfig.support_phone,
                    terms_url: whiteLabelConfig.terms_url,
                    privacy_url: whiteLabelConfig.privacy_url,
                    meta_title: whiteLabelConfig.meta_title,
                    meta_description: whiteLabelConfig.meta_description,
                    facebook_url: whiteLabelConfig.facebook_url,
                    instagram_url: whiteLabelConfig.instagram_url,
                    markup_percentage: whiteLabelConfig.markup_percentage ?? null,
                    markup_fixed: whiteLabelConfig.markup_fixed ?? null,
                    markup_type: whiteLabelConfig.markup_type ?? null
                } : null
            }
        })

    } catch (error) {
        console.error('Error detecting tenant:', error)
        return NextResponse.json({
            success: true,
            data: null,
            message: 'Error detecting tenant — falling back to default'
        })
    }
}
