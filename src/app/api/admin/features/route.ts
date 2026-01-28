// API Route: /api/admin/features
// GET: List all features with role access
// PUT: Update feature settings
// Build: 27 Ene 2026 - v2.233

import { NextRequest, NextResponse } from 'next/server';
import { FeatureService } from '@/services/FeatureService';
import { verifyToken } from '@/services/AuthService';

// GET: Obtener todos los features
export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Admin Features] No auth header');
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        console.log('[Admin Features] Decoded token:', decoded);

        if (!decoded) {
            console.log('[Admin Features] Token inválido o expirado');
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' } },
                { status: 401 }
            );
        }

        // Verificar rol (aceptar varios formatos)
        const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'];
        const userRole = decoded.role?.toUpperCase() || '';

        if (!allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
            console.log('[Admin Features] Rol no autorizado:', decoded.role);
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado - Rol insuficiente' } },
                { status: 403 }
            );
        }

        // Obtener parámetros de query
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const role = searchParams.get('role') || decoded.role;

        let features;

        if (category) {
            features = await FeatureService.getFeaturesByCategory(category);
        } else {
            features = await FeatureService.getFeaturesWithRoleAccess(role);
        }

        const categories = await FeatureService.getCategories();
        const settings = await FeatureService.getAllAppSettings();

        return NextResponse.json({
            success: true,
            data: {
                features,
                categories,
                settings
            }
        });
    } catch (error) {
        console.error('Error in GET /api/admin/features:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } },
            { status: 500 }
        );
    }
}

// PUT: Actualizar feature
export async function PUT(request: NextRequest) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        if (!decoded || !['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { code, is_global_enabled, web_enabled, mobile_enabled, name, description, role_access } = body;

        if (!code) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Código de feature requerido' } },
                { status: 400 }
            );
        }

        // Actualizar feature
        const updatedFeature = await FeatureService.updateFeature(code, {
            is_global_enabled,
            web_enabled,
            mobile_enabled,
            name,
            description
        });

        if (!updatedFeature) {
            return NextResponse.json(
                { success: false, error: { code: 'NOT_FOUND', message: 'Feature no encontrado' } },
                { status: 404 }
            );
        }

        // Actualizar acceso por rol si se proporciona
        if (role_access && typeof role_access === 'object') {
            for (const [role, access] of Object.entries(role_access)) {
                const { web_enabled: roleWeb, mobile_enabled: roleMobile } = access as { web_enabled: boolean; mobile_enabled: boolean };
                await FeatureService.updateFeatureRoleAccess(code, role, roleWeb, roleMobile);
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedFeature
        });
    } catch (error) {
        console.error('Error in PUT /api/admin/features:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } },
            { status: 500 }
        );
    }
}

// POST: Actualizar configuración de app
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        if (!decoded || !['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: { code: 'BAD_REQUEST', message: 'Key y value requeridos' } },
                { status: 400 }
            );
        }

        const success = await FeatureService.updateAppSetting(key, value);

        if (!success) {
            return NextResponse.json(
                { success: false, error: { code: 'UPDATE_FAILED', message: 'No se pudo actualizar' } },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { key, value }
        });
    } catch (error) {
        console.error('Error in POST /api/admin/features:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } },
            { status: 500 }
        );
    }
}
