// check-specific-tours.js - Verificar datos específicos de tours
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function checkSpecificTours() {
    console.log('🔍 VERIFICANDO TOURS ESPECÍFICOS\n');
    console.log('='.repeat(70));

    const tourCodes = ['MT-60968', 'MT-12534'];

    for (const code of tourCodes) {
        console.log(`\n📦 TOUR: ${code}`);
        console.log('-'.repeat(70));

        try {
            // Obtener datos del paquete
            const packages = await sql`
                SELECT 
                    mt_code,
                    name,
                    price_usd,
                    taxes_usd,
                    includes,
                    not_includes,
                    days,
                    nights
                FROM megatravel_packages
                WHERE mt_code = ${code}
            `;

            if (packages.length === 0) {
                console.log('❌ Tour no encontrado en la base de datos');
                continue;
            }

            const pkg = packages[0];

            console.log(`\n📋 INFORMACIÓN BÁSICA:`);
            console.log(`   Nombre: ${pkg.name}`);
            console.log(`   Duración: ${pkg.days} días / ${pkg.nights} noches`);

            console.log(`\n💰 PRECIOS:`);
            console.log(`   Precio: ${pkg.price_usd ? `$${pkg.price_usd} USD` : '❌ NO DISPONIBLE'}`);
            console.log(`   Impuestos: ${pkg.taxes_usd ? `$${pkg.taxes_usd} USD` : '❌ NO DISPONIBLE'}`);

            console.log(`\n✅ INCLUYE:`);
            if (pkg.includes && Array.isArray(pkg.includes) && pkg.includes.length > 0) {
                console.log(`   Total: ${pkg.includes.length} items`);
                console.log(`   Primeros 5:`);
                pkg.includes.slice(0, 5).forEach((item, idx) => {
                    console.log(`   ${idx + 1}. ${item.substring(0, 80)}${item.length > 80 ? '...' : ''}`);
                });
            } else {
                console.log(`   ❌ NO DISPONIBLE (${typeof pkg.includes})`);
            }

            console.log(`\n❌ NO INCLUYE:`);
            if (pkg.not_includes && Array.isArray(pkg.not_includes) && pkg.not_includes.length > 0) {
                console.log(`   Total: ${pkg.not_includes.length} items`);
                console.log(`   Primeros 5:`);
                pkg.not_includes.slice(0, 5).forEach((item, idx) => {
                    console.log(`   ${idx + 1}. ${item.substring(0, 80)}${item.length > 80 ? '...' : ''}`);
                });
            } else {
                console.log(`   ❌ NO DISPONIBLE`);
            }

            // Verificar itinerario
            const itinerary = await sql`
                SELECT 
                    day_number,
                    title,
                    description
                FROM megatravel_itinerary
                WHERE package_id = (SELECT id FROM megatravel_packages WHERE mt_code = ${code})
                ORDER BY day_number
            `;

            console.log(`\n📅 ITINERARIO:`);
            if (itinerary.length > 0) {
                console.log(`   Total: ${itinerary.length} días`);
                console.log(`   Primeros 3 días:`);
                itinerary.slice(0, 3).forEach((day) => {
                    console.log(`   Día ${day.day_number}: ${day.title}`);
                    console.log(`      ${day.description.substring(0, 100)}...`);
                });
            } else {
                console.log(`   ❌ NO DISPONIBLE`);
            }

        } catch (error) {
            console.error(`❌ Error:`, error.message);
        }

        console.log('='.repeat(70));
    }

    console.log('\n✅ VERIFICACIÓN COMPLETADA');
}

checkSpecificTours();
