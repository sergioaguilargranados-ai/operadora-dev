const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function setup() {
  const client = await pool.connect()

  try {
    console.log('🔄 Paso 1: Creando tabla payment_transactions...')

    const migration008 = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '008_create_payment_transactions.sql'),
      'utf8'
    )

    await client.query(migration008)
    console.log('✅ Tabla payment_transactions creada')

    console.log('\n🔄 Paso 2: Insertando datos de prueba...')

    const migration009 = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '009_test_data_payments_approvals.sql'),
      'utf8'
    )

    await client.query(migration009)
    console.log('✅ Datos de prueba insertados')

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

    console.log('\n✅ Setup completado exitosamente!')

  } catch (error) {
    console.error('❌ Error en setup:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

setup()
