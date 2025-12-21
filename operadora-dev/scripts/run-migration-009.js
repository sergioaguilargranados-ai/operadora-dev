const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function runMigration() {
  const client = await pool.connect()

  try {
    console.log('🔄 Ejecutando migración 009...')

    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '009_test_data_payments_approvals.sql'),
      'utf8'
    )

    await client.query(sql)

    console.log('✅ Migración 009 ejecutada exitosamente')
    console.log('\n📊 Verificando datos...\n')

    // Verificar transacciones
    const payments = await client.query(`
      SELECT status, payment_method, COUNT(*) as count, SUM(amount) as total
      FROM payment_transactions
      GROUP BY status, payment_method
      ORDER BY status, payment_method
    `)

    console.log('💳 Transacciones de Pago:')
    console.table(payments.rows)

    // Verificar aprobaciones
    const approvals = await client.query(`
      SELECT status, COUNT(*) as count, SUM(amount) as total
      FROM travel_approvals
      GROUP BY status
      ORDER BY status
    `)

    console.log('\n✅ Aprobaciones de Viaje:')
    console.table(approvals.rows)

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
