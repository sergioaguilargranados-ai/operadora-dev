// API de Viajes Grupales (MegaTravel) - Endpoint público
// Build: 16 Jul 2026 - v2.425 - Sistema Híbrido MegaTravel

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelSyncService } from '@/services/MegaTravelSyncService';

/**
 * GET /api/groups
 * Obtener paquetes de viajes grupales disponibles (público)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parámetros de filtro
        const category = searchParams.get('category') || undefined;
        const region = searchParams.get('region') || undefined;
        const destination = searchParams.get('destination') || undefined;
        const featured = searchParams.get('featured') === 'true';
        const search = searchParams.get('search') || searchParams.get('q') || undefined;
        const limit = parseInt(searchParams.get('limit') || '1000');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Obtener paquetes con precios calculados (ya incluyen margen)
        let packages = await MegaTravelSyncService.getPackagesWithPrices({
            category,
            region,
            featured: featured || undefined,
            search: search || destination
        });

        // Transformar para el frontend
        const formattedPackages = packages.map(pkg => ({
            id: pkg.mt_code?.replace('MT-', 'AS-'),
            slug: pkg.slug,
            name: pkg.name,
            description: pkg.description,

            // Destinos
            region: pkg.destination_region,
            category: pkg.category,
            subcategory: pkg.subcategory,
            cities: pkg.cities || [],
            countries: pkg.countries || [],
            mainCountry: pkg.main_country,

            // Duración
            days: pkg.days,
            nights: pkg.nights,
            duration: `${pkg.days} días / ${pkg.nights} noches`,

            // Precios (ya con margen aplicado)
            pricing: {
                basePrice: pkg.sale_price_usd,          // Precio con nuestro margen
                taxes: pkg.taxes_usd,                    // Impuestos (sin margen)
                totalPrice: pkg.total_price_usd,         // Total (precio + impuestos)
                originalPrice: pkg.total_price_usd * 1.1, // "Precio tachado" para marketing
                savings: pkg.savings_usd,                // Ahorro ficticio
                currency: pkg.currency || 'USD',
                priceType: pkg.price_per_person_type || 'Por persona en habitación Doble',
                variants: pkg.price_variants || {}
            },

            // Vuelo
            flight: {
                included: pkg.includes_flight,
                airline: pkg.flight_airline,
                origin: pkg.flight_origin || 'CDMX'
            },

            // Hotel
            hotel: {
                category: pkg.hotel_category || 'Turista',
                mealPlan: pkg.meal_plan || 'Según itinerario'
            },

            // Incluye / No incluye
            includes: pkg.includes || [],
            notIncludes: pkg.not_includes || [],

            // Tours opcionales
            optionalTours: pkg.optional_tours || [],

            // Imágenes
            images: {
                main: pkg.main_image,
                gallery: pkg.gallery_images || [],
                map: pkg.map_image
            },

            // Tags y destacados
            tags: pkg.tags || [],
            isFeatured: pkg.is_featured,
            isOffer: pkg.is_offer,

            // Info adicional
            tipsAmount: pkg.tips_amount,
            importantNotes: pkg.important_notes,

            // URL original (para referencia interna)
            externalUrl: pkg.mt_url
        }));

        // Aplicar paginación
        const paginatedPackages = formattedPackages.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: {
                packages: paginatedPackages,
                total: formattedPackages.length,
                limit,
                offset,
                hasMore: offset + limit < formattedPackages.length
            },
            meta: {
                source: 'megatravel',
                lastSync: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error en GET /api/groups:', error);

        // Fallback con datos mock si hay error
        return NextResponse.json({
            success: true,
            data: {
                packages: [],
                total: 0,
                limit: 50,
                offset: 0,
                hasMore: false
            },
            meta: {
                source: 'fallback',
                error: 'Error al cargar paquetes'
            }
        });
    }
}

/**
 * GET /api/groups/[code] - Individual package
 * Este endpoint se maneja en route con searchParams
 */
