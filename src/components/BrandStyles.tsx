// BrandStyles.tsx - Inyecta CSS variables dinámicas del tenant actual
// Build: 23 Jul 2026 - v2.430 - Fase 1 Multi-Empresa

'use client';

import { useEffect } from 'react';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';

/**
 * Componente que inyecta CSS variables en :root basadas en la configuración
 * del tenant actual. Esto permite que cualquier componente use los colores
 * de marca sin importar si es white-label o AS Operadora.
 * 
 * Uso en CSS/Tailwind: var(--brand-primary), var(--brand-secondary), etc.
 */
export function BrandStyles() {
    const { primaryColor, secondaryColor, accentColor, isWhiteLabel, isLoading } = useWhiteLabel()

    useEffect(() => {
        if (isLoading) return

        const root = document.documentElement

        // Colores de marca
        root.style.setProperty('--brand-primary', primaryColor)
        root.style.setProperty('--brand-secondary', secondaryColor)
        root.style.setProperty('--brand-accent', accentColor)

        // Colores derivados (hover states, backgrounds, etc.)
        root.style.setProperty('--brand-primary-hover', adjustBrightness(primaryColor, -15))
        root.style.setProperty('--brand-primary-light', adjustBrightness(primaryColor, 40))
        root.style.setProperty('--brand-primary-bg', adjustBrightness(primaryColor, 85))
        root.style.setProperty('--brand-secondary-hover', adjustBrightness(secondaryColor, -15))

        // Flag de white-label como CSS custom property (útil para condicionales CSS)
        root.style.setProperty('--is-white-label', isWhiteLabel ? '1' : '0')

        return () => {
            // Cleanup: restaurar valores por defecto
            root.style.removeProperty('--brand-primary')
            root.style.removeProperty('--brand-secondary')
            root.style.removeProperty('--brand-accent')
            root.style.removeProperty('--brand-primary-hover')
            root.style.removeProperty('--brand-primary-light')
            root.style.removeProperty('--brand-primary-bg')
            root.style.removeProperty('--brand-secondary-hover')
            root.style.removeProperty('--is-white-label')
        }
    }, [primaryColor, secondaryColor, accentColor, isWhiteLabel, isLoading])

    // Este componente no renderiza nada visual
    return null
}

/**
 * Ajusta el brillo de un color hex
 * @param hex - Color en formato hex (#RRGGBB)
 * @param percent - Porcentaje de ajuste (-100 a 100). Negativo = más oscuro
 */
function adjustBrightness(hex: string, percent: number): string {
    // Limpiar el #
    const cleanHex = hex.replace('#', '')

    // Parsear RGB
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)

    // Ajustar
    const adjust = (value: number) => {
        if (percent > 0) {
            // Aclarar: mezclar con blanco
            return Math.min(255, Math.round(value + (255 - value) * (percent / 100)))
        } else {
            // Oscurecer: mezclar con negro
            return Math.max(0, Math.round(value * (1 + percent / 100)))
        }
    }

    const newR = adjust(r).toString(16).padStart(2, '0')
    const newG = adjust(g).toString(16).padStart(2, '0')
    const newB = adjust(b).toString(16).padStart(2, '0')

    return `#${newR}${newG}${newB}`
}

export default BrandStyles
