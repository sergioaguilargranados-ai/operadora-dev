require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function cargarDatosPrueba() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definido en .env.local')
    console.log('\n📝 Por favor agrega tu DATABASE_URL de Neon en .env.local')
    console.log('   Ejemplo: DATABASE_URL=postgresql://user:pass@host/db')
    process.exit(1)
  }

  console.log('🔗 Usando DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...')

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conectado exitosamente')

    console.log('\n📂 Leyendo archivo SQL...')
    let sqlFile = fs.readFileSync(path.join(__dirname, 'datos-prueba-completos.sql'), 'utf8')

    // Remover comandos de psql que no son compatibles
    sqlFile = sqlFile.split('\n').filter(line => !line.trim().startsWith('\\')).join('\n')

    console.log('🚀 Ejecutando script SQL...\n')

    // Ejecutar el SQL
    const result = await client.query(sqlFile)

    console.log('\n✅ Script ejecutado exitosamente!')
    console.log('\n📊 Verificando datos creados...\n')

    // Verificar usuarios
    const users = await client.query('SELECT email, full_name, role FROM users ORDER BY role')
    console.log('👥 USUARIOS CREADOS:')
    users.rows.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`)
    })

    // Verificar reservas
    const bookings = await client.query('SELECT COUNT(*) as count FROM bookings')
    console.log(`\n✈️  RESERVAS: ${bookings.rows[0].count}`)

    // Verificar empleados
    const employees = await client.query('SELECT COUNT(*) as count FROM employees')
    console.log(`👔 EMPLEADOS: ${employees.rows[0].count}`)

    // Verificar aprobaciones
    const approvals = await client.query(`
      SELECT status, COUNT(*) as count
      FROM approval_requests
      GROUP BY status
    `)
    console.log('\n✅ APROBACIONES:')
    approvals.rows.forEach(a => {
      console.log(`   - ${a.status}: ${a.count}`)
    })

    // Verificar transacciones
    const payments = await client.query('SELECT COUNT(*) as count FROM payment_transactions')
    console.log(`\n💳 TRANSACCIONES: ${payments.rows[0].count}`)

    // Verificar centro de costos
    const costCenters = await client.query('SELECT COUNT(*) as count FROM cost_centers')
    console.log(`💰 CENTROS DE COSTO: ${costCenters.rows[0].count}`)

    console.log('\n🎉 ¡DATOS DE PRUEBA CARGADOS EXITOSAMENTE!\n')
    console.log('📝 Credenciales para login:')
    console.log('   Email: admin@asoperadora.com')
    console.log('   Password: Password123!')
    console.log('\n🌐 Inicia el servidor y ve a: http://localhost:3000/login\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Desconectado de la base de datos')
  }
}

cargarDatosPrueba()
