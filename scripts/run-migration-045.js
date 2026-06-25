// Ejecutar migración 045: tabla mobile_app_content
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
      path.join(process.cwd(), 'migrations', '045_mobile_app_content.sql'),
      'utf8'
    )
    
    console.log('Ejecutando migración 045...')
    const result = await pool.query(sql)
    console.log('✅ Migración 045 ejecutada exitosamente')
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

run()
