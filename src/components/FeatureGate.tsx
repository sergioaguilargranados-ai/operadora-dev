// FeatureGate.tsx - Componente para control de visibilidad de features
// Build: 23 Jul 2026 - v2.430 - Sistema de Administración Granular

'use client';

import React, { ReactNode } from 'react';
import { useFeature, useFeatures } from '@/contexts/FeaturesContext';

interface FeatureGateProps {
    feature: string;
    children: ReactNode;
    fallback?: ReactNode;
    showLoading?: boolean;
}

/**
 * Componente que envuelve elementos y los muestra solo si el feature está habilitado
 * 
 * @example
 * <FeatureGate feature="SEARCH_HOTELS">
 *   <TabsTrigger value="stays">Hoteles</TabsTrigger>
 * </FeatureGate>
 */
export function FeatureGate({
    feature,
    children,
    fallback = null,
    showLoading = false
}: FeatureGateProps) {
    const { loading } = useFeatures();
    const isEnabled = useFeature(feature);

    // Mientras carga, mostrar loading spinner si se solicita, o nada
    if (loading) {
        return showLoading ? <LoadingPlaceholder /> : null;
    }

    // Si el feature está habilitado, mostrar children
    if (isEnabled) {
        return <>{children}</>;
    }

    // Si no está habilitado, mostrar fallback o nada
    return <>{fallback}</>;
}

/**
 * Hook para uso en componentes que necesitan verificar múltiples features
 * 
 * @example
 * const { hasFeature } = useFeatureCheck();
 * if (hasFeature('SEARCH_HOTELS')) { ... }
 */
export function useFeatureCheck() {
    const { isFeatureEnabled, loading, features } = useFeatures();

    return {
        hasFeature: isFeatureEnabled,
        loading,
        features,
        hasAnyFeature: (codes: string[]) => codes.some(code => isFeatureEnabled(code)),
        hasAllFeatures: (codes: string[]) => codes.every(code => isFeatureEnabled(code))
    };
}

/**
 * Componente placeholder para estados de carga
 */
function LoadingPlaceholder() {
    return (
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20" />
    );
}

/**
 * HOC para envolver componentes completos con feature gate
 * 
 * @example
 * const HotelsTabWithGate = withFeatureGate(HotelsTab, 'SEARCH_HOTELS');
 */
export function withFeatureGate<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    feature: string,
    FallbackComponent?: React.ComponentType
) {
    return function FeatureGatedComponent(props: P) {
        const isEnabled = useFeature(feature);

        if (!isEnabled) {
            return FallbackComponent ? <FallbackComponent /> : null;
        }

        return <WrappedComponent {...props} />;
    };
}

export default FeatureGate;
