// Ejecutar migración 044: tablas expo
require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', '044_expo_landing_tables.sql'),
      'utf8'
    )
    
    console.log('Ejecutando migración 044...')
    const result = await pool.query(sql)
    console.log('✅ Migración 044 ejecutada exitosamente')
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

run()
