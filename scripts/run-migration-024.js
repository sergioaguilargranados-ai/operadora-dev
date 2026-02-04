// Script simple para ejecutar migración SQL en Neon (versión corregida)
const { Client } = require('pg')

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
})

async function runMigration() {
    try {
        await client.connect()
        console.log('✅ Conectado a Neon')

        // Primero verificar estructura de app_settings
        const structure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'app_settings'
      ORDER BY ordinal_position
    `)

        console.log('📋 Estructura de app_settings:')
        structure.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`))

        // Insertar sin columna category si no existe
        const sql = `
      INSERT INTO app_settings (key, value, description, updated_at)
      VALUES 
        ('CIVITATIS_AGENCY_ID', '67114', 'ID de agencia de Civitatis para enlaces de afiliado', NOW())
      ON CONFLICT (key) DO UPDATE 
      SET 
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = NOW();
    `

        await client.query(sql)
        console.log('✅ Migración ejecutada: CIVITATIS_AGENCY_ID = 67114')

        // Verificar
        const result = await client.query("SELECT key, value, description FROM app_settings WHERE key = 'CIVITATIS_AGENCY_ID'")
        console.log('📝 Verificación:', result.rows[0])

    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await client.end()
    }
}

runMigration()
