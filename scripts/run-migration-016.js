// Script para ejecutar migración 016 - Tabla tour_quotes
// Ejecutar: node scripts/run-migration-016.js

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
})

async function runMigration() {
    const client = await pool.connect()

    try {
        console.log('🚀 Iniciando migración 016...\n')

        // Leer archivo SQL
        const sqlPath = path.join(__dirname, '..', 'migrations', '016_create_tour_quotes_table.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        // Ejecutar migración
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('COMMIT')

        console.log('✅ Migración 016 ejecutada exitosamente\n')

        // Verificar tabla creada
        const checkTable = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tour_quotes'
      ORDER BY ordinal_position
    `)

        console.log('📋 Estructura de la tabla tour_quotes:')
        console.log('─'.repeat(80))
        checkTable.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
        })
        console.log('─'.repeat(80))
        console.log(`\n✅ Total de columnas: ${checkTable.rows.length}`)

        // Verificar índices
        const checkIndexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'tour_quotes'
    `)

        console.log('\n📊 Índices creados:')
        console.log('─'.repeat(80))
        checkIndexes.rows.forEach(idx => {
            console.log(`  ${idx.indexname}`)
        })
        console.log('─'.repeat(80))
        console.log(`\n✅ Total de índices: ${checkIndexes.rows.length}`)

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('❌ Error en migración:', error.message)
        throw error
    } finally {
        client.release()
        await pool.end()
    }
}

runMigration()
    .then(() => {
        console.log('\n🎉 Migración completada exitosamente')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error)
        process.exit(1)
    })
