// FeaturesContext.tsx - Contexto global para gestión de features
// Build: 27 Ene 2026 - v2.233 - Sistema de Administración Granular

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface FeaturesContextType {
    features: string[];
    loading: boolean;
    loginRequired: boolean;
    isFeatureEnabled: (code: string) => boolean;
    refreshFeatures: () => Promise<void>;
}

const FeaturesContext = createContext<FeaturesContextType | null>(null);

export function FeaturesProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [features, setFeatures] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loginRequired, setLoginRequired] = useState(false);

    const fetchFeatures = useCallback(async () => {
        try {
            setLoading(true);

            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            // Obtener token del localStorage
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('as_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch('/api/features/user?platform=web', { headers });
            const data = await response.json();

            if (data.success) {
                setFeatures(data.data.features || []);
                setLoginRequired(data.data.loginRequired || false);
            } else {
                console.error('Error fetching features:', data.error);
                setFeatures([]);
            }
        } catch (error) {
            console.error('Error fetching features:', error);
            setFeatures([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar features al montar y cuando cambie la autenticación
    useEffect(() => {
        fetchFeatures();
    }, [fetchFeatures, isAuthenticated, user?.role]);

    const isFeatureEnabled = useCallback((code: string): boolean => {
        return features.includes(code);
    }, [features]);

    const refreshFeatures = useCallback(async () => {
        await fetchFeatures();
    }, [fetchFeatures]);

    return (
        <FeaturesContext.Provider value={{
            features,
            loading,
            loginRequired,
            isFeatureEnabled,
            refreshFeatures
        }}>
            {children}
        </FeaturesContext.Provider>
    );
}

export function useFeatures() {
    const context = useContext(FeaturesContext);
    if (!context) {
        throw new Error('useFeatures must be used within a FeaturesProvider');
    }
    return context;
}

// Hook de conveniencia para verificar un feature específico
export function useFeature(code: string): boolean {
    const { isFeatureEnabled, loading } = useFeatures();

    // Mientras carga, retornamos false por seguridad
    if (loading) return false;

    return isFeatureEnabled(code);
}

export default FeaturesContext;
