// check-table-structure.js - Verificar estructura de la tabla
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.local
config({ path: join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function checkTableStructure() {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE LA TABLA\n');
    console.log('='.repeat(70));

    try {
        // Verificar estructura de la tabla
        const structureResult = await sql`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'megatravel_packages'
            AND column_name IN ('includes', 'not_includes', 'price_usd', 'taxes_usd')
            ORDER BY ordinal_position
        `;

        console.log('Estructura de columnas relevantes:');
        structureResult.forEach(col => {
            console.log(`\n- ${col.column_name}`);
            console.log(`  Tipo: ${col.data_type}`);
            console.log(`  Nullable: ${col.is_nullable}`);
            console.log(`  Default: ${col.column_default || 'NULL'}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('📊 MUESTRA DE DATOS REALES');
        console.log('='.repeat(70));

        // Obtener muestra de datos sin filtrar
        const sampleResult = await sql`
            SELECT 
                mt_code,
                name,
                price_usd,
                taxes_usd,
                includes::text as includes_text,
                not_includes::text as not_includes_text
            FROM megatravel_packages
            ORDER BY id
            LIMIT 5
        `;

        sampleResult.forEach((row, idx) => {
            console.log(`\n${idx + 1}. ${row.mt_code}`);
            console.log(`   Nombre: ${row.name.substring(0, 50)}...`);
            console.log(`   Precio: ${row.price_usd}`);
            console.log(`   Impuestos: ${row.taxes_usd}`);
            console.log(`   Includes (texto): ${row.includes_text}`);
            console.log(`   Not Includes (texto): ${row.not_includes_text}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ VERIFICACIÓN COMPLETADA');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTableStructure();
