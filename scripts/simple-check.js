// simple-check.js - Verificación simple de datos
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function simpleCheck() {
    console.log('🔍 VERIFICACIÓN SIMPLE DE DATOS\n');
    console.log('='.repeat(70));

    try {
        // Total de tours
        const totalResult = await sql`SELECT COUNT(*) as total FROM megatravel_packages`;
        const total = parseInt(totalResult[0].total);
        console.log(`📊 Total de tours: ${total}`);

        // Tours con precio
        const withPriceResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE price_usd IS NOT NULL AND price_usd > 0
        `;
        const withPrice = parseInt(withPriceResult[0].count);
        console.log(`💰 Tours con precio: ${withPrice} (${((withPrice / total) * 100).toFixed(1)}%)`);

        // Tours con impuestos
        const withTaxesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE taxes_usd IS NOT NULL AND taxes_usd > 0
        `;
        const withTaxes = parseInt(withTaxesResult[0].count);
        console.log(`💵 Tours con impuestos: ${withTaxes} (${((withTaxes / total) * 100).toFixed(1)}%)`);

        // Tours con includes (usando array_length)
        const withIncludesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE array_length(includes, 1) > 0
        `;
        const withIncludes = parseInt(withIncludesResult[0].count);
        console.log(`✅ Tours con includes: ${withIncludes} (${((withIncludes / total) * 100).toFixed(1)}%)`);

        // Tours con not_includes (usando array_length)
        const withNotIncludesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE array_length(not_includes, 1) > 0
        `;
        const withNotIncludes = parseInt(withNotIncludesResult[0].count);
        console.log(`❌ Tours con not_includes: ${withNotIncludes} (${((withNotIncludes / total) * 100).toFixed(1)}%)`);

        console.log('\n' + '='.repeat(70));
        console.log('📋 MUESTRA DE 5 TOURS CON DATOS');
        console.log('='.repeat(70));

        // Muestra de tours con datos
        const sampleWithData = await sql`
            SELECT 
                mt_code,
                name,
                price_usd,
                taxes_usd,
                array_length(includes, 1) as includes_count,
                array_length(not_includes, 1) as not_includes_count
            FROM megatravel_packages
            WHERE array_length(includes, 1) > 0
            ORDER BY id
            LIMIT 5
        `;

        sampleWithData.forEach((row, idx) => {
            console.log(`\n${idx + 1}. ${row.mt_code} - ${row.name.substring(0, 40)}...`);
            console.log(`   Precio: ${row.price_usd || 'NULL'} USD`);
            console.log(`   Impuestos: ${row.taxes_usd || 'NULL'} USD`);
            console.log(`   Includes: ${row.includes_count} items`);
            console.log(`   Not Includes: ${row.not_includes_count || 0} items`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('📋 MUESTRA DE 5 TOURS SIN INCLUDES');
        console.log('='.repeat(70));

        // Muestra de tours sin includes
        const sampleWithoutIncludes = await sql`
            SELECT 
                mt_code,
                name,
                price_usd,
                taxes_usd,
                array_length(includes, 1) as includes_count
            FROM megatravel_packages
            WHERE array_length(includes, 1) IS NULL OR array_length(includes, 1) = 0
            ORDER BY id
            LIMIT 5
        `;

        sampleWithoutIncludes.forEach((row, idx) => {
            console.log(`\n${idx + 1}. ${row.mt_code} - ${row.name.substring(0, 40)}...`);
            console.log(`   Precio: ${row.price_usd || 'NULL'} USD`);
            console.log(`   Impuestos: ${row.taxes_usd || 'NULL'} USD`);
            console.log(`   Includes: ${row.includes_count || 0} items`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ VERIFICACIÓN COMPLETADA');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

simpleCheck();
