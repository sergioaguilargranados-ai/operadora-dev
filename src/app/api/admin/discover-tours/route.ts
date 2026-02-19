// API endpoint para descubrir tours de UNA categoría de MegaTravel
// Diseñado para ser llamado en batch desde el frontend (una categoría a la vez)
// Build: 19 Feb 2026 - v2.322 - Con last_sync_at + log-sync + cleanup

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import * as cheerio from 'cheerio';

// Las 9 categorías de MegaTravel
const CATEGORIES = [
    { url: 'https://www.megatravel.com.mx/viajes-europa', category: 'Europa' },
    { url: 'https://www.megatravel.com.mx/viaje-a-turquia', category: 'Turquía' },
    { url: 'https://www.megatravel.com.mx/viajes-asia', category: 'Asia' },
    { url: 'https://www.megatravel.com.mx/viaje-a-japon', category: 'Japón' },
    { url: 'https://www.megatravel.com.mx/viajes-medio-oriente', category: 'Medio Oriente' },
    { url: 'https://www.megatravel.com.mx/viajes-estados-unidos', category: 'Estados Unidos' },
    { url: 'https://www.megatravel.com.mx/viajes-canada', category: 'Canadá' },
    { url: 'https://www.megatravel.com.mx/viajes-sudamerica', category: 'Sudamérica' },
    { url: 'https://www.megatravel.com.mx/cruceros', category: 'Cruceros' },
];

// GET: Obtener lista de categorías disponibles
export async function GET() {
    return NextResponse.json({
        success: true,
        categories: CATEGORIES.map((c, i) => ({ index: i, ...c })),
        totalCategories: CATEGORIES.length
    });
}

// POST: Descubrir tours de una categoría específica o acciones especiales
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, categoryIndex, discoveredCodes } = body;

        // ===== ACCIÓN: Limpiar syncs "running" que se quedaron pegados =====
        if (action === 'cleanup-stale') {
            const cleanupResult = await pool.query(
                `UPDATE megatravel_sync_log 
                 SET status = 'failed', 
                     completed_at = CURRENT_TIMESTAMP,
                     error_message = 'Proceso interrumpido (timeout o cierre del navegador)'
                 WHERE status = 'running' 
                   AND started_at < CURRENT_TIMESTAMP - INTERVAL '10 minutes'
                 RETURNING id`
            );
            return NextResponse.json({
                success: true,
                action: 'cleanup-stale',
                cleaned: cleanupResult.rowCount || 0
            });
        }

        // ===== ACCIÓN: Registrar una sincronización en el historial =====
        if (action === 'log-sync') {
            const { totalFound, newTours, updated, deprecated, triggeredBy } = body;
            await pool.query(
                `INSERT INTO megatravel_sync_log 
                 (sync_type, started_at, completed_at, packages_found, packages_synced, packages_failed, status, triggered_by, details)
                 VALUES ('discover', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $1, $2, $3, 'completed', $4, $5)`,
                [
                    totalFound || 0,
                    (newTours || 0) + (updated || 0),
                    deprecated || 0,
                    triggeredBy || 'admin',
                    JSON.stringify({ newTours, updated, deprecated, type: 'discover-tours' })
                ]
            );
            return NextResponse.json({ success: true, action: 'log-sync' });
        }

        // ===== ACCIÓN: Deprecar tours que ya no existen =====
        if (action === 'deprecate' && Array.isArray(discoveredCodes) && discoveredCodes.length > 0) {
            const placeholders = discoveredCodes.map((_: string, i: number) => `$${i + 1}`).join(', ');
            const deprecatedResult = await pool.query(
                `UPDATE megatravel_packages 
                 SET is_active = false, sync_status = 'deprecated', 
                     sync_error = 'Tour no encontrado en última sincronización', 
                     updated_at = CURRENT_TIMESTAMP,
                     last_sync_at = CURRENT_TIMESTAMP
                 WHERE is_active = true AND mt_code NOT IN (${placeholders})
                 RETURNING mt_code`,
                discoveredCodes
            );

            const deprecated = deprecatedResult.rows.map((r: any) => r.mt_code);
            return NextResponse.json({
                success: true,
                action: 'deprecate',
                deprecatedCount: deprecated.length,
                deprecatedCodes: deprecated
            });
        }

        // ===== ACCIÓN: Descubrir tours de una categoría =====
        if (typeof categoryIndex !== 'number' || categoryIndex < 0 || categoryIndex >= CATEGORIES.length) {
            return NextResponse.json({ success: false, error: 'categoryIndex inválido' }, { status: 400 });
        }

        const categoryInfo = CATEGORIES[categoryIndex];
        console.log(`📂 Descubriendo tours: ${categoryInfo.category} (${categoryInfo.url})`);

        // Usar fetch + cheerio (sin Puppeteer) - mucho más rápido y ligero
        const response = await fetch(categoryInfo.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
            },
            signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} al acceder a ${categoryInfo.url}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Buscar links a tours individuales: /viaje/nombre-tour-12345.html
        const tourLinks = new Set<string>();
        $('a[href*="/viaje/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.includes('.html')) {
                const fullUrl = href.startsWith('http')
                    ? href
                    : `https://www.megatravel.com.mx${href}`;
                tourLinks.add(fullUrl);
            }
        });

        const tours: Array<{ mt_code: string; mt_url: string; name: string; category: string }> = [];
        const insertedCodes: string[] = [];
        const updatedCodes: string[] = [];

        for (const url of tourLinks) {
            // Extraer código MT desde la URL
            const codeMatch = url.match(/\/viaje\/.*-(\d+)\.html/);
            const mtCode = codeMatch ? `MT-${codeMatch[1]}` : null;
            if (!mtCode) continue;

            // Extraer nombre desde URL
            const nameMatch = url.match(/\/viaje\/(.+)-\d+\.html/);
            const name = nameMatch
                ? nameMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : 'Tour sin nombre';

            tours.push({ mt_code: mtCode, mt_url: url, name, category: categoryInfo.category });

            // Upsert en la BD
            try {
                const existing = await pool.query(
                    'SELECT id, is_active FROM megatravel_packages WHERE mt_code = $1',
                    [mtCode]
                );

                if (existing.rows.length === 0) {
                    // NUEVO tour - insertar
                    await pool.query(
                        `INSERT INTO megatravel_packages (mt_code, mt_url, name, category, destination_region, is_active, sync_status, created_at, updated_at, last_sync_at)
                         VALUES ($1, $2, $3, $4, $5, true, 'synced', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                        [mtCode, url, name, categoryInfo.category, categoryInfo.category]
                    );
                    insertedCodes.push(mtCode);
                } else {
                    // Tour existente - actualizar URL, reactivar si estaba inactivo, y actualizar last_sync_at
                    await pool.query(
                        `UPDATE megatravel_packages 
                         SET mt_url = $1, category = $2, destination_region = $3, is_active = true, 
                             sync_status = 'synced', sync_error = NULL, 
                             updated_at = CURRENT_TIMESTAMP, last_sync_at = CURRENT_TIMESTAMP
                         WHERE mt_code = $4`,
                        [url, categoryInfo.category, categoryInfo.category, mtCode]
                    );
                    updatedCodes.push(mtCode);
                }
            } catch (dbErr: any) {
                console.error(`   DB error for ${mtCode}:`, dbErr.message);
            }
        }

        console.log(`   ✅ ${categoryInfo.category}: ${tours.length} tours (${insertedCodes.length} nuevos, ${updatedCodes.length} actualizados)`);

        return NextResponse.json({
            success: true,
            category: categoryInfo.category,
            toursFound: tours.length,
            tours: tours.map(t => t.mt_code),
            inserted: insertedCodes,
            updated: updatedCodes,
        });

    } catch (error: any) {
        console.error('❌ Error en discover-tours:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Error desconocido'
        }, { status: 500 });
    }
}
