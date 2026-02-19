// API Admin MegaTravel - Sincronización y gestión de paquetes
// Build: 27 Ene 2026 - v2.234 - Sistema Híbrido MegaTravel

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelSyncService } from '@/services/MegaTravelSyncService';
import { verifyToken } from '@/services/AuthService';
import { cookies } from 'next/headers';

import { pool } from '@/lib/db';

// Roles permitidos para acceder a esta API
const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN'];

/**
 * Verificar autenticación de admin
 * Soporta: JWT cookie, Authorization header, y fallback as_user cookie + BD
 */
async function verifyAdminAuth(request: NextRequest): Promise<{ authorized: boolean; user?: any; error?: string }> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('as_token');
        const authHeader = request.headers.get('Authorization');

        const token = tokenCookie?.value || authHeader?.replace('Bearer ', '');

        if (token) {
            try {
                const decoded = await verifyToken(token);
                if (decoded && ALLOWED_ROLES.includes(decoded.role)) {
                    return { authorized: true, user: decoded };
                }
            } catch {
                // JWT expirado o inválido, intentar fallback
            }
        }

        // Fallback: cookie as_user verificada contra BD
        const userCookie = cookieStore.get('as_user');
        if (userCookie?.value) {
            try {
                const userData = JSON.parse(decodeURIComponent(userCookie.value));
                if (userData.email && userData.id) {
                    const userCheck = await pool.query(
                        'SELECT id, email, role FROM users WHERE id = $1 AND email = $2 LIMIT 1',
                        [userData.id, userData.email]
                    );
                    if (userCheck.rows.length > 0 && ALLOWED_ROLES.includes(userCheck.rows[0].role)) {
                        return { authorized: true, user: userCheck.rows[0] };
                    }
                }
            } catch { /* cookie inválida */ }
        }

        return { authorized: false, error: 'No autorizado' };
    } catch (error) {
        console.error('Auth error:', error);
        return { authorized: false, error: 'Error de autenticación' };
    }
}

/**
 * GET /api/admin/megatravel
 * Obtener estado y estadísticas de MegaTravel
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAdminAuth(request);
        if (!auth.authorized) {
            return NextResponse.json({
                success: false,
                error: { message: auth.error }
            }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action') || 'stats';

        switch (action) {
            case 'stats': {
                const stats = await MegaTravelSyncService.getStats();
                const canSync = await MegaTravelSyncService.canSync();
                const history = await MegaTravelSyncService.getSyncHistory(5);

                return NextResponse.json({
                    success: true,
                    data: {
                        stats,
                        canSync: canSync.canSync,
                        lastSync: canSync.lastSync,
                        syncMessage: canSync.reason || 'Sincronización disponible',
                        recentSyncs: history
                    }
                });
            }

            case 'packages': {
                const category = searchParams.get('category') || undefined;
                const region = searchParams.get('region') || undefined;
                const featured = searchParams.get('featured') === 'true';
                const search = searchParams.get('search') || undefined;

                const packages = await MegaTravelSyncService.getPackagesWithPrices({
                    category,
                    region,
                    featured: featured || undefined,
                    search
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        packages,
                        total: packages.length
                    }
                });
            }

            case 'history': {
                const limit = parseInt(searchParams.get('limit') || '20');
                const history = await MegaTravelSyncService.getSyncHistory(limit);

                return NextResponse.json({
                    success: true,
                    data: { history }
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: { message: 'Acción no válida' }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Error en GET /api/admin/megatravel:', error);
        return NextResponse.json({
            success: false,
            error: { message: 'Error interno del servidor' }
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/megatravel
 * Iniciar sincronización
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdminAuth(request);
        if (!auth.authorized) {
            return NextResponse.json({
                success: false,
                error: { message: auth.error }
            }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const action = body.action || 'sync';

        switch (action) {
            case 'sync': {
                // Verificar si se puede sincronizar
                const canSync = await MegaTravelSyncService.canSync();

                // Permitir forzar sincronización si se especifica
                if (!canSync.canSync && !body.force) {
                    return NextResponse.json({
                        success: false,
                        error: {
                            message: canSync.reason,
                            lastSync: canSync.lastSync
                        }
                    }, { status: 429 }); // Too Many Requests
                }

                // Iniciar sincronización
                const result = await MegaTravelSyncService.startFullSync(auth.user?.email || 'admin');

                return NextResponse.json({
                    success: result.success,
                    data: {
                        syncId: result.syncId,
                        packagesFound: result.packagesFound,
                        packagesSynced: result.packagesSynced,
                        packagesFailed: result.packagesFailed,
                        duration: `${(result.duration / 1000).toFixed(2)}s`,
                        errors: result.errors.length > 0 ? result.errors : undefined
                    }
                });
            }

            default:
                return NextResponse.json({
                    success: false,
                    error: { message: 'Acción no válida' }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Error en POST /api/admin/megatravel:', error);
        return NextResponse.json({
            success: false,
            error: { message: 'Error interno del servidor' }
        }, { status: 500 });
    }
}
