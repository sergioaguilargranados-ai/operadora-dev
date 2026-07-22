// API Route: /api/features/user
// GET: Get enabled features for current user
// Build: 22 Jul 2026 - v2.429

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { FeatureService, Platform } from '@/services/FeatureService';
import { verifyToken } from '@/services/AuthService';

export async function GET(request: NextRequest) {
    try {
        // Obtener plataforma del header o query
        const { searchParams } = new URL(request.url);
        const platform = (searchParams.get('platform') || 'web') as Platform;

        // Verificar autenticación (opcional para obtener features públicos)
        const authHeader = request.headers.get('authorization');
        let role = 'GUEST'; // Rol por defecto para usuarios no autenticados
        let userId: number | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = await verifyToken(token);
            if (decoded) {
                role = decoded.role;
                userId = decoded.userId;
            }
        }

        // Obtener features habilitados para este rol y plataforma
        const enabledFeatures = await FeatureService.getEnabledFeaturesForUser(role, platform);

        // Obtener configuración de login obligatorio
        const loginRequired = await FeatureService.isLoginRequired(platform);

        // Obtener todas las categorías para referencia
        const categories = await FeatureService.getCategories();

        return NextResponse.json({
            success: true,
            data: {
                features: enabledFeatures,
                role,
                platform,
                loginRequired,
                categories,
                userId
            }
        });
    } catch (error) {
        console.error('Error in GET /api/features/user:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } },
            { status: 500 }
        );
    }
}
