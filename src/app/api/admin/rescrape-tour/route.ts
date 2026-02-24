// API para forzar re-scrape de un tour específico
// Build: 24 Feb 2026 - v2.328c
// Permite re-scrapear un tour individual para probar cambios antes de lanzar sync completo.
// GET: Muestra info del tour y URL que se scrapeará
// POST: Ejecuta el re-scrape y devuelve resultados

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * GET /api/admin/rescrape-tour?code=MT-60968
 * Muestra info del tour antes de re-scrapear
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({
                success: false,
                error: 'Parámetro ?code= requerido (ej: MT-60968)',
                usage: 'GET /api/admin/rescrape-tour?code=MT-60968'
            }, { status: 400 });
        }

        // Buscar el tour
        const result = await pool.query(`
            SELECT id, mt_code, name, mt_url, main_image, 
                   gallery_images, price_usd, taxes_usd, days, nights,
                   destination_region, main_country, updated_at
            FROM megatravel_packages WHERE mt_code = $1
        `, [code]);

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: `Tour ${code} no encontrado`
            }, { status: 404 });
        }

        const tour = result.rows[0];

        // Contar departures actuales
        let departureCount = 0;
        try {
            const depResult = await pool.query(
                'SELECT COUNT(*) as count FROM megatravel_departures WHERE package_id = $1',
                [tour.id]
            );
            departureCount = parseInt(depResult.rows[0].count);
        } catch { /* tabla puede no existir */ }

        // Contar itinerary days
        let itineraryCount = 0;
        try {
            const itinResult = await pool.query(
                'SELECT COUNT(*) as count FROM megatravel_itinerary WHERE package_id = $1',
                [tour.id]
            );
            itineraryCount = parseInt(itinResult.rows[0].count);
        } catch { /* tabla puede no existir */ }

        return NextResponse.json({
            success: true,
            tour: {
                id: tour.id,
                code: tour.mt_code,
                name: tour.name,
                url: tour.mt_url,
                mainImage: tour.main_image,
                galleryCount: (tour.gallery_images || []).length,
                price: tour.price_usd,
                taxes: tour.taxes_usd,
                days: tour.days,
                nights: tour.nights,
                region: tour.destination_region,
                country: tour.main_country,
                departureCount,
                itineraryCount,
                lastUpdated: tour.updated_at
            },
            instructions: 'Para re-scrapear, haz POST a esta misma URL con ?code=' + code
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/rescrape-tour?code=MT-60968
 * Ejecuta re-scrape completo del tour
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({
                success: false,
                error: 'Parámetro ?code= requerido'
            }, { status: 400 });
        }

        console.log(`🔄 Re-scrape solicitado para tour ${code}...`);

        // Buscar el tour
        const result = await pool.query(`
            SELECT id, mt_code, name, mt_url, main_image, gallery_images,
                   price_usd, taxes_usd
            FROM megatravel_packages WHERE mt_code = $1
        `, [code]);

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: `Tour ${code} no encontrado`
            }, { status: 404 });
        }

        const tour = result.rows[0];
        const packageId = tour.id;
        const tourUrl = tour.mt_url;

        if (!tourUrl) {
            return NextResponse.json({
                success: false,
                error: `Tour ${code} no tiene URL de MegaTravel`
            }, { status: 400 });
        }

        // Estado ANTES del re-scrape
        let depCountBefore = 0;
        try {
            const r = await pool.query('SELECT COUNT(*) as count FROM megatravel_departures WHERE package_id = $1', [packageId]);
            depCountBefore = parseInt(r.rows[0].count);
        } catch { /* */ }

        const beforeState = {
            mainImage: tour.main_image,
            galleryCount: (tour.gallery_images || []).length,
            price: tour.price_usd,
            taxes: tour.taxes_usd,
            departureCount: depCountBefore
        };

        // Ejecutar re-scrape
        console.log(`   📡 Scraping: ${tourUrl}`);
        const startTime = Date.now();

        const { MegaTravelScrapingService } = await import('@/services/MegaTravelScrapingService');
        const scrapedData = await MegaTravelScrapingService.scrapeTourComplete(tourUrl, packageId);

        // Guardar los datos
        await MegaTravelScrapingService.saveScrapedData(packageId, scrapedData);

        // Actualizar campos en megatravel_packages que vienen del scrape
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIdx = 1;

        // Actualizar main_image si el scrape encontró una NO genérica
        const genericPatterns = [
            'europa', 'asia', 'turquia', 'japon', 'corea', 'medio-oriente',
            'dubai', 'egipto', 'sudamerica', 'usa-', 'canada', 'cruceros',
            'africa', 'mexico', 'balcanes', 'centroamerica', 'caribe',
            'bellezasde', 'banner-mega', 'celebrity-millennium', 'celebrity-milennium'
        ];
        const codeOnly = code.replace('MT-', '');
        const isGenericImage = (url: string) => {
            const lower = url.toLowerCase();
            // Si contiene el código del tour, NO es genérica
            if (lower.includes(codeOnly)) return false;
            // Si contiene un patrón genérico, SÍ es genérica
            return genericPatterns.some(p => lower.includes(p));
        };

        if (scrapedData.images.main && !isGenericImage(scrapedData.images.main)) {
            updateFields.push(`main_image = $${paramIdx++}`);
            updateValues.push(scrapedData.images.main);
        } else if (scrapedData.images.main) {
            console.log(`   ⚠️ Imagen genérica detectada, NO se guardará: ${scrapedData.images.main}`);
        }

        // Actualizar gallery
        if (scrapedData.images.gallery && scrapedData.images.gallery.length > 0) {
            updateFields.push(`gallery_images = $${paramIdx++}`);
            updateValues.push(scrapedData.images.gallery);
        }

        // Actualizar map
        if (scrapedData.images.map) {
            updateFields.push(`map_image = $${paramIdx++}`);
            updateValues.push(scrapedData.images.map);
        }

        // Actualizar precio si se encontró
        if (scrapedData.pricing.price_usd) {
            updateFields.push(`price_usd = $${paramIdx++}`);
            updateValues.push(scrapedData.pricing.price_usd);
        }
        if (scrapedData.pricing.taxes_usd) {
            updateFields.push(`taxes_usd = $${paramIdx++}`);
            updateValues.push(scrapedData.pricing.taxes_usd);
        }

        // Actualizar includes/not_includes
        if (scrapedData.includes && scrapedData.includes.length > 0) {
            updateFields.push(`includes = $${paramIdx++}`);
            updateValues.push(scrapedData.includes);
        }
        if (scrapedData.not_includes && scrapedData.not_includes.length > 0) {
            updateFields.push(`not_includes = $${paramIdx++}`);
            updateValues.push(scrapedData.not_includes);
        }

        // Actualizar cities, countries, days, nights
        if (scrapedData.cities && scrapedData.cities.length > 0) {
            updateFields.push(`cities = $${paramIdx++}`);
            updateValues.push(scrapedData.cities);
        }
        if (scrapedData.countries && scrapedData.countries.length > 0) {
            updateFields.push(`countries = $${paramIdx++}`);
            updateValues.push(scrapedData.countries);
        }
        if (scrapedData.days) {
            updateFields.push(`days = $${paramIdx++}`);
            updateValues.push(scrapedData.days);
        }
        if (scrapedData.nights) {
            updateFields.push(`nights = $${paramIdx++}`);
            updateValues.push(scrapedData.nights);
        }

        // Tags
        if (scrapedData.tags && scrapedData.tags.length > 0) {
            updateFields.push(`tags = $${paramIdx++}`);
            updateValues.push(scrapedData.tags);
        }

        updateFields.push('updated_at = NOW()');

        if (updateFields.length > 1) { // > 1 porque siempre hay updated_at
            updateValues.push(code);
            await pool.query(
                `UPDATE megatravel_packages SET ${updateFields.join(', ')} WHERE mt_code = $${paramIdx}`,
                updateValues
            );
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        // Estado DESPUÉS del re-scrape
        let depCountAfter = 0;
        try {
            const r = await pool.query('SELECT COUNT(*) as count FROM megatravel_departures WHERE package_id = $1', [packageId]);
            depCountAfter = parseInt(r.rows[0].count);
        } catch { /* */ }

        const afterState = {
            mainImage: scrapedData.images.main,
            galleryCount: scrapedData.images.gallery.length,
            price: scrapedData.pricing.price_usd,
            taxes: scrapedData.pricing.taxes_usd,
            departureCount: depCountAfter,
            itineraryDays: scrapedData.itinerary.length,
            includes: scrapedData.includes.length,
            notIncludes: scrapedData.not_includes.length,
            optionalTours: scrapedData.optionalTours.length,
            cities: scrapedData.cities,
            countries: scrapedData.countries,
            tags: scrapedData.tags
        };

        console.log(`✅ Re-scrape de ${code} completado en ${elapsed}s`);

        return NextResponse.json({
            success: true,
            message: `Re-scrape de ${code} completado en ${elapsed}s`,
            before: beforeState,
            after: afterState,
            changes: {
                mainImageChanged: beforeState.mainImage !== afterState.mainImage,
                galleryChanged: beforeState.galleryCount !== afterState.galleryCount,
                priceChanged: beforeState.price !== afterState.price,
                taxesChanged: beforeState.taxes !== afterState.taxes,
                departuresChanged: beforeState.departureCount !== afterState.departureCount,
            },
            departures: scrapedData.departures.slice(0, 10).map(d => ({
                date: d.departure_date,
                price: d.price_usd,
                taxes: d.taxes_usd,
                total: d.total_usd,
                origin: d.origin_city,
                availability: d.availability
            })),
            totalDepartures: scrapedData.departures.length
        });

    } catch (error: any) {
        console.error(`❌ Error en re-scrape:`, error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack?.substring(0, 500)
        }, { status: 500 });
    }
}
