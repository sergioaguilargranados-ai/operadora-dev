// verify-tours-manually.js - Verificar tours manualmente en el sitio
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function verifyToursManually() {
    console.log('🔍 VERIFICACIÓN MANUAL DE TOURS\n');
    console.log('='.repeat(70));

    try {
        // Obtener 10 tours SIN precio
        const toursWithoutPrice = await sql`
            SELECT mt_code, name, mt_url, price_usd
            FROM megatravel_packages
            WHERE price_usd IS NULL OR price_usd = 0
            ORDER BY id
            LIMIT 10
        `;

        // Obtener 10 tours CON precio
        const toursWithPrice = await sql`
            SELECT mt_code, name, mt_url, price_usd
            FROM megatravel_packages
            WHERE price_usd IS NOT NULL AND price_usd > 0
            ORDER BY id
            LIMIT 10
        `;

        console.log('\n📋 TOURS SIN PRECIO (10 ejemplos)');
        console.log('='.repeat(70));
        console.log('\n⚠️  POR FAVOR VERIFICA ESTOS TOURS MANUALMENTE:');
        console.log('   Abre cada URL y verifica si tiene precio publicado\n');

        toursWithoutPrice.forEach((tour, idx) => {
            console.log(`${idx + 1}. ${tour.mt_code} - ${tour.name.substring(0, 50)}...`);
            console.log(`   URL: ${tour.mt_url}`);
            console.log(`   Precio en BD: ${tour.price_usd || 'NULL'}`);
            console.log('');
        });

        console.log('\n' + '='.repeat(70));
        console.log('📋 TOURS CON PRECIO (10 ejemplos)');
        console.log('='.repeat(70));
        console.log('\n✅ ESTOS TOURS SÍ TIENEN PRECIO:\n');

        toursWithPrice.forEach((tour, idx) => {
            console.log(`${idx + 1}. ${tour.mt_code} - ${tour.name.substring(0, 50)}...`);
            console.log(`   URL: ${tour.mt_url}`);
            console.log(`   Precio en BD: $${tour.price_usd} USD`);
            console.log('');
        });

        console.log('\n' + '='.repeat(70));
        console.log('📊 INSTRUCCIONES');
        console.log('='.repeat(70));
        console.log(`
1. Abre 3-4 tours de la lista "SIN PRECIO"
2. Verifica si en el sitio de MegaTravel tienen precio publicado
3. Si NO tienen precio → El scraping está correcto
4. Si SÍ tienen precio → Necesitamos ajustar los selectores CSS

5. Comparte conmigo:
   - ¿Los tours sin precio realmente no tienen precio en el sitio?
   - ¿O sí tienen precio pero el scraping no lo detecta?
   - Si tienen precio, ¿dónde está ubicado? (screenshot ayudaría)
        `);

        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyToursManually();
