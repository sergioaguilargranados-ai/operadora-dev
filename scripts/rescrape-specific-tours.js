// rescrape-specific-tours.js - Re-scrapear y guardar tours específicos
import { MegaTravelScrapingService } from '../src/services/MegaTravelScrapingService.ts';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function rescrapeTours() {
    console.log('🔄 RE-SCRAPEANDO TOURS ESPECÍFICOS\n');
    console.log('='.repeat(70));

    const tours = [
        { code: 'MT-60968', url: 'https://www.megatravel.com.mx/viaje/mediterraneo-azamara-onward-60968.html' },
        { code: 'MT-12534', url: 'https://www.megatravel.com.mx/viaje/mega-marruecos-12534.html' }
    ];

    for (const tour of tours) {
        console.log(`\n📦 PROCESANDO: ${tour.code}`);
        console.log(`   URL: ${tour.url}`);
        console.log('-'.repeat(70));

        try {
            // Obtener ID del paquete
            const packages = await sql`
                SELECT id FROM megatravel_packages WHERE mt_code = ${tour.code}
            `;

            if (packages.length === 0) {
                console.log(`❌ Tour ${tour.code} no encontrado en BD`);
                continue;
            }

            const packageId = packages[0].id;
            console.log(`   ID en BD: ${packageId}`);

            // Hacer scraping completo
            console.log(`   🔍 Scraping...`);
            const data = await MegaTravelScrapingService.scrapeTourComplete(tour.url, packageId);

            // Actualizar precios e includes en megatravel_packages
            console.log(`   💾 Guardando datos...`);

            await sql`
                UPDATE megatravel_packages
                SET 
                    price_usd = ${data.pricing.price_usd},
                    taxes_usd = ${data.pricing.taxes_usd},
                    includes = ${data.includes},
                    not_includes = ${data.not_includes},
                    days = ${data.itinerary.length},
                    nights = ${data.itinerary.length > 0 ? data.itinerary.length - 1 : 0},
                    updated_at = NOW()
                WHERE id = ${packageId}
            `;

            // Borrar itinerario anterior
            await sql`
                DELETE FROM megatravel_itinerary WHERE package_id = ${packageId}
            `;

            // Insertar nuevo itinerario
            if (data.itinerary.length > 0) {
                for (const day of data.itinerary) {
                    // Limitar campos para evitar errores de BD
                    const title = day.title.substring(0, 200);
                    const description = day.description.substring(0, 500);

                    await sql`
                        INSERT INTO megatravel_itinerary (
                            package_id,
                            day_number,
                            title,
                            description,
                            meals,
                            hotel,
                            city
                        ) VALUES (
                            ${packageId},
                            ${day.day_number},
                            ${title},
                            ${description},
                            ${day.meals || null},
                            ${day.hotel || null},
                            ${day.city || null}
                        )
                    `;
                }
            }

            console.log(`   ✅ Datos guardados correctamente`);
            console.log(`      - Precio: ${data.pricing.price_usd ? `$${data.pricing.price_usd} USD` : 'N/A'}`);
            console.log(`      - Impuestos: ${data.pricing.taxes_usd ? `$${data.pricing.taxes_usd} USD` : 'N/A'}`);
            console.log(`      - Includes: ${data.includes.length} items`);
            console.log(`      - Not Includes: ${data.not_includes.length} items`);
            console.log(`      - Itinerario: ${data.itinerary.length} días`);

        } catch (error) {
            console.error(`   ❌ Error:`, error.message);
        }

        console.log('='.repeat(70));
    }

    console.log('\n✅ PROCESO COMPLETADO');
}

rescrapeTours();
