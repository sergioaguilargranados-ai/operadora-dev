// Script para ejecutar migración 017 - Extensión de campos MegaTravel
// Build: 31 Ene 2026 - v2.255

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🔄 Iniciando migración 017...\n');

        // Leer archivo SQL
        const migrationPath = path.join(__dirname, '..', 'migrations', '017_extend_megatravel_packages.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Ejecutar migración
        console.log('📝 Ejecutando SQL...');
        await client.query(migrationSQL);

        console.log('\n✅ Migración 017 completada exitosamente!\n');

        // Verificar campos
        console.log('🔍 Verificando campos agregados...\n');
        const result = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'megatravel_packages' 
              AND column_name IN ('visa_requirements', 'supplements', 'detailed_hotels', 'important_notes')
            ORDER BY column_name
        `);

        console.log('Campos en megatravel_packages:');
        console.table(result.rows);

        // Verificar índices
        const indexes = await client.query(`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE tablename = 'megatravel_packages'
              AND indexname LIKE 'idx_megatravel_%'
            ORDER BY indexname
        `);

        console.log('\nÍndices creados:');
        console.table(indexes.rows);

        // Verificar migración registrada
        const migrationCheck = await client.query(`
            SELECT * FROM app_settings WHERE key = 'MIGRATION_017_EXECUTED'
        `);

        if (migrationCheck.rows.length > 0) {
            console.log('\n✅ Migración registrada en app_settings:');
            console.log(`   Ejecutada: ${migrationCheck.rows[0].value}`);
        }

        console.log('\n🎉 ¡Todo listo! Los nuevos campos están disponibles.\n');

    } catch (error) {
        console.error('\n❌ Error ejecutando migración:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar
runMigration()
    .then(() => {
        console.log('✅ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script falló:', error);
        process.exit(1);
    });
