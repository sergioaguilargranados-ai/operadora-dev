// BrandMeta.tsx - Favicon y título dinámicos por tenant
// Build: 16 Jul 2026 - v2.425 - Fase 2 Multi-Empresa / White-Label

'use client';

import { useEffect } from 'react';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';

/**
 * Componente que actualiza dinámicamente el <title> y favicon
 * según la configuración del tenant actual.
 * 
 * En modo white-label: usa meta_title y favicon_url del tenant
 * En modo default: usa los valores de AS Operadora
 */
export function BrandMeta() {
    const { metaTitle, metaDescription, faviconUrl, isWhiteLabel, isLoading } = useWhiteLabel();

    useEffect(() => {
        if (isLoading) return;

        // Actualizar título del documento
        document.title = metaTitle;

        // Actualizar meta description
        let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = metaDescription;

        // Actualizar favicon si hay uno del tenant
        if (faviconUrl) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = faviconUrl;

            // También actualizar apple-touch-icon si existe
            let appleFav = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
            if (appleFav) {
                appleFav.href = faviconUrl;
            }
        }

        // Actualizar og:title y og:description
        updateMetaTag('og:title', metaTitle);
        updateMetaTag('og:description', metaDescription);

        return () => {
            // Cleanup: restaurar defaults
            document.title = 'AS Operadora de Viajes y Eventos | AS Viajando';
            if (metaDesc) {
                metaDesc.content = 'Descubre experiencias únicas con AS Operadora de Viajes y Eventos.';
            }
        };
    }, [metaTitle, metaDescription, faviconUrl, isWhiteLabel, isLoading]);

    return null;
}

/**
 * Helper para actualizar o crear meta tags de Open Graph
 */
function updateMetaTag(property: string, content: string) {
    let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

export default BrandMeta;
