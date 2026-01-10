#!/usr/bin/env node

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conectado exitosamente')

    console.log('📖 Leyendo migración 012_cities_table.sql...')
    const migrationPath = path.join(__dirname, '..', 'migrations', '012_cities_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('⚙️ Ejecutando migración...')
    await client.query(migrationSQL)
    console.log('✅ Migración 012 ejecutada exitosamente')

    console.log('\n📊 Verificando tabla cities...')
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'cities'
      ORDER BY ordinal_position
    `)

    console.log('Columnas creadas:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })

    // Verificar función y trigger
    console.log('\n📊 Verificando función normalize_city_name...')
    const funcResult = await client.query(`
      SELECT normalize_city_name('CANCÚN') as normalized
    `)
    console.log(`  Test: 'CANCÚN' → '${funcResult.rows[0].normalized}' ✓`)

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Conexión cerrada')
  }
}

runMigration()
