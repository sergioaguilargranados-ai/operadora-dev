/**
 * Script para ejecutar migración 010 - Centro de Comunicación
 * Fecha: 20 Diciembre 2025
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('🚀 Iniciando migración 010 - Centro de Comunicación...')

    // Leer archivo SQL
    const sqlPath = path.join(__dirname, '../migrations/010_communication_center.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Ejecutar migración
    await pool.query(sql)

    console.log('✅ Migración 010 completada exitosamente!')

    // Verificar tablas creadas
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'communication_%'
        OR table_name IN ('messages', 'message_%', 'quick_responses')
      ORDER BY table_name
    `)

    console.log('\n📊 Tablas creadas:')
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`)
    })

    // Verificar datos iniciales
    const settings = await pool.query('SELECT COUNT(*) as count FROM communication_settings')
    const templates = await pool.query('SELECT COUNT(*) as count FROM message_templates')
    const quickResponses = await pool.query('SELECT COUNT(*) as count FROM quick_responses')

    console.log('\n📝 Datos iniciales:')
    console.log(`  ✓ Configuraciones: ${settings.rows[0].count}`)
    console.log(`  ✓ Templates: ${templates.rows[0].count}`)
    console.log(`  ✓ Respuestas rápidas: ${quickResponses.rows[0].count}`)

    console.log('\n🎉 ¡Todo listo! El Centro de Comunicación está operativo.')

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    throw error
  } finally {
    await pool.end()
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
