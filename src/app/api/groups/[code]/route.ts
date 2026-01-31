// API de Viajes Grupales - Detalle de paquete individual
// Build: 31 Ene 2026 - v2.256 - Todos los campos MegaTravel completos

import { NextRequest, NextResponse } from 'next/server';
import { MegaTravelSyncService } from '@/services/MegaTravelSyncService';

interface RouteParams {
    params: Promise<{
        code: string;
    }>;
}

/**
 * GET /api/groups/[code]
 * Obtener detalle completo de un paquete
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json({
                success: false,
                error: { message: 'Código de paquete requerido' }
            }, { status: 400 });
        }

        // Normalizar código (puede venir como "12117" o "MT-12117")
        const mtCode = code.startsWith('MT-') ? code : `MT-${code}`;

        const pkg = await MegaTravelSyncService.getPackageByCode(mtCode);

        if (!pkg) {
            return NextResponse.json({
                success: false,
                error: { message: 'Paquete no encontrado' }
            }, { status: 404 });
        }

        // Transformar para el frontend con TODA la información
        const formattedPackage = {
            id: pkg.mt_code,
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
                basePrice: pkg.sale_price_usd,
                taxes: pkg.taxes_usd,
                totalPrice: pkg.total_price_usd,
                originalPrice: Math.round(pkg.total_price_usd * 1.1),
                savings: pkg.savings_usd,
                currency: pkg.currency || 'USD',
                priceType: pkg.price_per_person_type || 'Por persona en habitación Doble',
                priceVariants: pkg.price_variants || {},
                // Desglose para mostrar al cliente
                breakdown: {
                    netPrice: pkg.sale_price_usd,
                    taxes: pkg.taxes_usd,
                    tips: pkg.tips_amount || 'Propinas no incluidas',
                    total: pkg.total_price_usd
                }
            },

            // Vuelo
            flight: {
                included: pkg.includes_flight,
                airline: pkg.flight_airline || 'Aerolínea Regular',
                origin: pkg.flight_origin || 'Ciudad de México (CDMX)',
                class: 'Turista'
            },

            // Hotel
            hotel: {
                category: pkg.hotel_category || 'Turista',
                mealPlan: pkg.meal_plan || 'Según itinerario',
                details: pkg.hotels || []
            },

            // Incluye / No incluye
            includes: pkg.includes || [],
            notIncludes: pkg.not_includes || [],

            // Itinerario día por día
            itinerary: pkg.itinerary || [],
            itinerarySummary: pkg.itinerary_summary,

            // Tours opcionales - COMPLETOS con todos los campos
            optionalTours: (pkg.optional_tours || []).map((tour: any) => ({
                code: tour.code,
                name: tour.name,
                description: tour.description,
                price: tour.price_usd ? {
                    amount: tour.price_usd,
                    currency: 'USD'
                } : null,
                valid_dates: tour.valid_dates,
                activities: tour.activities,
                conditions: tour.conditions
            })),

            // Fechas de salida
            departures: pkg.departures || [],
            seasonPrices: pkg.season_prices || {},

            // NUEVOS CAMPOS
            detailedHotels: pkg.detailed_hotels || [],
            supplements: pkg.supplements || [],
            visaRequirements: pkg.visa_requirements ?
                (typeof pkg.visa_requirements === 'string' ?
                    JSON.parse(pkg.visa_requirements) :
                    pkg.visa_requirements) :
                [],
            importantNotes: pkg.important_notes ?
                (typeof pkg.important_notes === 'string' ?
                    [pkg.important_notes] :
                    pkg.important_notes) :
                [],
            mapImage: pkg.map_image,

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
            offerEndDate: pkg.offer_end_date,

            // Información importante (legacy)
            tipsAmount: pkg.tips_amount,

            // Metadata
            lastUpdated: pkg.updated_at,
            externalUrl: pkg.mt_url
        };

        return NextResponse.json({
            success: true,
            data: formattedPackage
        });

    } catch (error) {
        console.error('Error en GET /api/groups/[code]:', error);
        return NextResponse.json({
            success: false,
            error: { message: 'Error al obtener el paquete' }
        }, { status: 500 });
    }
}
