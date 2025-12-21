import { pool } from './src/lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración 010: Itinerarios y Cotizaciones...\n')

    const sqlPath = path.join(process.cwd(), 'database', 'migrations', '010_itineraries_quotes.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    await pool.query(sql)

    console.log('✅ Migración 010 completada exitosamente\n')

    // Verificar datos
    const itineraries = await pool.query('SELECT COUNT(*) FROM itineraries')
    const quotes = await pool.query('SELECT COUNT(*) FROM quotes')
    const items = await pool.query('SELECT COUNT(*) FROM quote_items')

    console.log('📊 Resumen:')
    console.log(`  - ${itineraries.rows[0].count} itinerarios`)
    console.log(`  - ${quotes.rows[0].count} cotizaciones`)
    console.log(`  - ${items.rows[0].count} items de cotización`)

    process.exit(0)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()
