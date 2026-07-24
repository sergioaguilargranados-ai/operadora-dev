// WhiteLabelContext.tsx - Contexto global para Multi-Empresa y Marca Blanca
// Build: 23 Jul 2026 - v2.431 - Fase 1 Multi-Empresa

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ─────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────

export interface WhiteLabelTenant {
    id: number
    tenant_type: 'corporate' | 'agency'
    company_name: string
    logo_url: string | null
    logo_mobile_url: string | null
    logo_dark_url?: string | null
    primary_color: string | null
    secondary_color: string | null
    accent_color: string | null
    custom_domain: string | null
    email: string | null
    phone: string | null
    is_active: boolean
}

export interface WhiteLabelConfigData {
    favicon_url: string | null
    footer_text: string | null
    support_email: string | null
    support_phone: string | null
    terms_url: string | null
    privacy_url: string | null
    meta_title: string | null
    meta_description: string | null
    facebook_url: string | null
    instagram_url: string | null
    markup_percentage: number | null
    markup_fixed: number | null
    markup_type: 'percentage' | 'fixed' | 'both' | null
}

export interface WhiteLabelState {
    // Tenant info
    tenantId: number | null
    tenantType: 'corporate' | 'agency' | null
    companyName: string
    slogan: string

    // Visual branding
    logoUrl: string | null
    logoMobileUrl: string | null
    logoDarkUrl: string | null
    faviconUrl: string | null
    primaryColor: string
    secondaryColor: string
    accentColor: string

    // Contact
    supportEmail: string
    supportPhone: string

    // Footer & Legal
    footerText: string
    termsUrl: string | null
    privacyUrl: string | null

    // Social
    facebookUrl: string | null
    instagramUrl: string | null

    // SEO
    metaTitle: string
    metaDescription: string

    // Markup pricing
    markupPercentage: number
    markupFixed: number
    markupType: 'percentage' | 'fixed' | 'both'

    // State flags
    isWhiteLabel: boolean
    isLoading: boolean
    error: string | null
}

interface WhiteLabelContextType extends WhiteLabelState {
    refresh: () => Promise<void>
    applyMarkup: (basePrice: number) => number
}

// ─────────────────────────────────────────────────
// Defaults (AS Operadora branding)
// ─────────────────────────────────────────────────

const AS_OPERADORA_DEFAULTS: WhiteLabelState = {
    tenantId: null,
    tenantType: null,
    companyName: 'AS Operadora de Viajes y Eventos',
    slogan: 'AS Viajando',

    // Visual branding
    logoUrl: null,
    logoMobileUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    primaryColor: '#FF6B00',
    secondaryColor: '#0052CC',
    accentColor: '#0066FF',

    supportEmail: 'contacto@asoperadora.com',
    supportPhone: '+52 720 815 6804',

    footerText: '© AS Operadora de Viajes y Eventos. Todos los derechos reservados.',
    termsUrl: null,
    privacyUrl: null,

    facebookUrl: null,
    instagramUrl: null,

    metaTitle: 'AS Operadora de Viajes y Eventos | AS Viajando',
    metaDescription: 'Descubre experiencias únicas con AS Operadora de Viajes y Eventos.',

    markupPercentage: 0,
    markupFixed: 0,
    markupType: 'percentage',

    isWhiteLabel: false,
    isLoading: true,
    error: null,
}

// ─────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────

const WhiteLabelContext = createContext<WhiteLabelContextType | null>(null);

// ─────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WhiteLabelState>(AS_OPERADORA_DEFAULTS)

    const detectTenant = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            // Obtener host actual para detección
            const currentHost = typeof window !== 'undefined' ? window.location.hostname : ''

            // Si es localhost sin subdomain, no hay tenant (AS Operadora default)
            if (!currentHost || currentHost === 'localhost' || currentHost === '127.0.0.1') {
                // En desarrollo, verificar si hay parámetro ?tenant= para testing
                const urlParams = typeof window !== 'undefined'
                    ? new URLSearchParams(window.location.search)
                    : null
                const testSubdomain = urlParams?.get('tenant')

                if (!testSubdomain) {
                    setState(prev => ({ ...prev, isLoading: false }))
                    return
                }

                // Testing mode: detectar por subdomain param
                const res = await fetch(`/api/tenant/detect?subdomain=${testSubdomain}`)
                const data = await res.json()

                if (data.success && data.data) {
                    applyTenantConfig(data.data.tenant, data.data.whiteLabelConfig)
                } else {
                    setState(prev => ({ ...prev, isLoading: false }))
                }
                return
            }

            // ── Optimización: leer config pre-fetched por middleware (cookie) ──
            if (typeof document !== 'undefined') {
                const cookieMatch = document.cookie.match(/x-tenant-config=([^;]+)/)
                if (cookieMatch) {
                    try {
                        const cachedData = JSON.parse(decodeURIComponent(cookieMatch[1]))
                        if (cachedData?.tenant && cachedData?.whiteLabelConfig !== undefined) {
                            applyTenantConfig(cachedData.tenant, cachedData.whiteLabelConfig)
                            console.log('WhiteLabel: Config loaded from middleware cache')
                            return
                        }
                    } catch {
                        // cookie inválida, seguir con fetch normal
                    }
                }
            }

            // Producción: detectar por host completo (fallback si no hay cookie)
            const res = await fetch(`/api/tenant/detect?host=${encodeURIComponent(currentHost)}`)
            const data = await res.json()

            if (data.success && data.data) {
                applyTenantConfig(data.data.tenant, data.data.whiteLabelConfig)
            } else {
                setState(prev => ({ ...prev, isLoading: false }))
            }

        } catch (error) {
            console.error('WhiteLabel: Error detecting tenant:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Error al detectar configuración de marca'
            }))
        }
    }, [])

    const applyTenantConfig = (
        tenant: WhiteLabelTenant,
        wlConfig: WhiteLabelConfigData | null
    ) => {
        setState({
            tenantId: tenant.id,
            tenantType: tenant.tenant_type,
            companyName: tenant.company_name || AS_OPERADORA_DEFAULTS.companyName,
            slogan: (tenant as any).slogan || AS_OPERADORA_DEFAULTS.slogan,

            logoUrl: tenant.logo_url,
            logoMobileUrl: (tenant as any).logo_mobile_url || null,
            logoDarkUrl: (tenant as any).logo_dark_url || null,
            faviconUrl: wlConfig?.favicon_url || null,
            primaryColor: tenant.primary_color || '#0066FF',
            secondaryColor: tenant.secondary_color || '#0052CC',
            accentColor: tenant.accent_color || tenant.primary_color || '#0066FF',

            supportEmail: wlConfig?.support_email || tenant.email || 'contacto@asoperadora.com',
            supportPhone: wlConfig?.support_phone || tenant.phone || '+52 720 815 6804',

            footerText: wlConfig?.footer_text || `© ${tenant.company_name}. Todos los derechos reservados.`,
            termsUrl: wlConfig?.terms_url || null,
            privacyUrl: wlConfig?.privacy_url || null,

            facebookUrl: wlConfig?.facebook_url || null,
            instagramUrl: wlConfig?.instagram_url || null,

            metaTitle: wlConfig?.meta_title || tenant.company_name,
            metaDescription: wlConfig?.meta_description || `Bienvenido a ${tenant.company_name}`,

            markupPercentage: Number(wlConfig?.markup_percentage) || 0,
            markupFixed: Number(wlConfig?.markup_fixed) || 0,
            markupType: wlConfig?.markup_type || 'percentage',

            isWhiteLabel: true,
            isLoading: false,
            error: null,
        })
    }

    // Detectar al montar
    useEffect(() => {
        detectTenant()
    }, [detectTenant])

    // Función para aplicar markup a un precio base
    const applyMarkup = useCallback((basePrice: number): number => {
        if (!state.isWhiteLabel) return basePrice
        const { markupPercentage, markupFixed, markupType } = state

        let finalPrice = basePrice
        if (markupType === 'percentage' || markupType === 'both') {
            finalPrice += basePrice * (markupPercentage / 100)
        }
        if (markupType === 'fixed' || markupType === 'both') {
            finalPrice += markupFixed
        }
        return Math.round(finalPrice * 100) / 100 // Redondear a 2 decimales
    }, [state.isWhiteLabel, state.markupPercentage, state.markupFixed, state.markupType])

    const contextValue: WhiteLabelContextType = {
        ...state,
        refresh: detectTenant,
        applyMarkup,
    }

    return (
        <WhiteLabelContext.Provider value={contextValue}>
            {children}
        </WhiteLabelContext.Provider>
    )
}

// ─────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────

/**
 * Hook principal para acceder a toda la configuración de marca blanca
 */
export function useWhiteLabel(): WhiteLabelContextType {
    const context = useContext(WhiteLabelContext)
    if (!context) {
        throw new Error('useWhiteLabel must be used within a WhiteLabelProvider')
    }
    return context
}

/**
 * Hook de conveniencia para obtener solo los colores de marca
 */
export function useBrandColors() {
    const { primaryColor, secondaryColor, accentColor } = useWhiteLabel()
    return { primaryColor, secondaryColor, accentColor }
}

/**
 * Hook de conveniencia para verificar si estamos en modo white-label
 */
export function useIsWhiteLabel(): boolean {
    const { isWhiteLabel } = useWhiteLabel()
    return isWhiteLabel
}

export default WhiteLabelContext
