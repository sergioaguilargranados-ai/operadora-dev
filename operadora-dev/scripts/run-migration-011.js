const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conectado exitosamente')

    console.log('📖 Leyendo migración 011_oauth_fields.sql...')
    const migrationPath = path.join(__dirname, '..', 'migrations', '011_oauth_fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('⚙️ Ejecutando migración...')
    await client.query(migrationSQL)
    console.log('✅ Migración 011 ejecutada exitosamente')

    console.log('\n📊 Verificando columnas...')
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('google_id', 'facebook_id', 'profile_image')
      ORDER BY column_name
    `)

    console.log('Columnas agregadas:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Conexión cerrada')
  }
}

runMigration()
