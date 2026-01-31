// Script para verificar campos de megatravel_packages
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkFields() {
    const client = await pool.connect();

    try {
        console.log('🔍 Verificando campos de megatravel_packages...\n');

        const result = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'megatravel_packages'
            ORDER BY ordinal_position
        `);

        console.log('Campos en megatravel_packages:');
        console.table(result.rows);

        // Verificar campos específicos
        const newFields = ['visa_requirements', 'supplements', 'detailed_hotels'];
        const existingFields = result.rows.map(r => r.column_name);

        console.log('\n📋 Estado de campos nuevos:');
        newFields.forEach(field => {
            const exists = existingFields.includes(field);
            console.log(`  ${exists ? '✅' : '❌'} ${field}: ${exists ? 'EXISTE' : 'NO EXISTE'}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkFields()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
