// verify-scraping-data.js - Verificar datos del scraping
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function verifyScrapingData() {
    console.log('🔍 VERIFICANDO DATOS DEL SCRAPING\n');
    console.log('='.repeat(70));

    try {
        // 1. Total de tours
        const totalResult = await sql`
            SELECT COUNT(*) as total
            FROM megatravel_packages
        `;
        const total = parseInt(totalResult[0].total);
        console.log(`📊 Total de tours: ${total}`);

        // 2. Tours con precio
        const withPriceResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE price_usd IS NOT NULL AND price_usd > 0
        `;
        const withPrice = parseInt(withPriceResult[0].count);
        console.log(`💰 Tours con precio: ${withPrice} (${((withPrice / total) * 100).toFixed(1)}%)`);

        // 3. Tours con impuestos
        const withTaxesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE taxes_usd IS NOT NULL AND taxes_usd > 0
        `;
        const withTaxes = parseInt(withTaxesResult[0].count);
        console.log(`💵 Tours con impuestos: ${withTaxes} (${((withTaxes / total) * 100).toFixed(1)}%)`);

        // 4. Tours con includes
        const withIncludesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE includes IS NOT NULL 
            AND includes != '[]' 
            AND includes != ''
            AND LENGTH(includes) > 2
        `;
        const withIncludes = parseInt(withIncludesResult[0].count);
        console.log(`✅ Tours con includes: ${withIncludes} (${((withIncludes / total) * 100).toFixed(1)}%)`);

        // 5. Tours con not_includes
        const withNotIncludesResult = await sql`
            SELECT COUNT(*) as count
            FROM megatravel_packages
            WHERE not_includes IS NOT NULL 
            AND not_includes != '[]' 
            AND not_includes != ''
            AND LENGTH(not_includes) > 2
        `;
        const withNotIncludes = parseInt(withNotIncludesResult[0].count);
        console.log(`❌ Tours con not_includes: ${withNotIncludes} (${((withNotIncludes / total) * 100).toFixed(1)}%)`);

        console.log('\n' + '='.repeat(70));
        console.log('📋 MUESTRA DE DATOS (Primeros 10 tours)');
        console.log('='.repeat(70));

        // 6. Muestra de datos
        const sampleResult = await sql`
            SELECT 
                mt_code,
                name,
                price_usd,
                taxes_usd,
                CASE 
                    WHEN includes IS NULL THEN 'NULL'
                    WHEN includes = '[]' THEN 'EMPTY_ARRAY'
                    WHEN includes = '' THEN 'EMPTY_STRING'
                    ELSE 'HAS_DATA'
                END as includes_status,
                CASE 
                    WHEN not_includes IS NULL THEN 'NULL'
                    WHEN not_includes = '[]' THEN 'EMPTY_ARRAY'
                    WHEN not_includes = '' THEN 'EMPTY_STRING'
                    ELSE 'HAS_DATA'
                END as not_includes_status
            FROM megatravel_packages
            ORDER BY id
            LIMIT 10
        `;

        sampleResult.forEach((row, idx) => {
            console.log(`\n${idx + 1}. ${row.mt_code} - ${row.name.substring(0, 40)}...`);
            console.log(`   Precio: ${row.price_usd || 'NULL'} USD`);
            console.log(`   Impuestos: ${row.taxes_usd || 'NULL'} USD`);
            console.log(`   Includes: ${row.includes_status}`);
            console.log(`   Not Includes: ${row.not_includes_status}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('🔍 VERIFICANDO ESTRUCTURA DE DATOS');
        console.log('='.repeat(70));

        // 7. Verificar tipo de dato de includes
        const includesTypeResult = await sql`
            SELECT 
                mt_code,
                includes,
                pg_typeof(includes) as includes_type,
                not_includes,
                pg_typeof(not_includes) as not_includes_type
            FROM megatravel_packages
            WHERE includes IS NOT NULL
            LIMIT 3
        `;

        console.log('\nTipo de datos de includes/not_includes:');
        includesTypeResult.forEach((row, idx) => {
            console.log(`\n${idx + 1}. ${row.mt_code}`);
            console.log(`   Includes type: ${row.includes_type}`);
            console.log(`   Includes value: ${JSON.stringify(row.includes).substring(0, 100)}...`);
            console.log(`   Not Includes type: ${row.not_includes_type}`);
            console.log(`   Not Includes value: ${JSON.stringify(row.not_includes).substring(0, 100)}...`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ VERIFICACIÓN COMPLETADA');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyScrapingData();
