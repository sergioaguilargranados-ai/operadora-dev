const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function ejecutarMigraciones() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definido')
    process.exit(1)
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conectado exitosamente\n')

    // Ejecutar esquema básico
    console.log('📂 Ejecutando esquema básico de BD...')
    let schema = fs.readFileSync(path.join(__dirname, 'schema-basico.sql'), 'utf8')

    // Remover comandos de psql
    schema = schema.split('\n').filter(line => !line.trim().startsWith('\\')).join('\n')

    await client.query(schema)
    console.log('✅ Esquema completo creado\n')

    // Ejecutar migraciones adicionales
    const migrations = [
      'migrations/003_payment_transactions.sql',
      'migrations/004_documents.sql'
    ]

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration)
      if (fs.existsSync(filePath)) {
        console.log(`📂 Ejecutando ${migration}...`)
        let sql = fs.readFileSync(filePath, 'utf8')
        sql = sql.split('\n').filter(line => !line.trim().startsWith('\\')).join('\n')

        try {
          await client.query(sql)
          console.log(`✅ ${migration} ejecutada\n`)
        } catch (error) {
          if (error.code === '42P07') {
            console.log(`⚠️  ${migration} ya existe, continuando...\n`)
          } else {
            throw error
          }
        }
      }
    }

    console.log('🎉 ¡Migraciones completadas!\n')

    // Verificar tablas creadas
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('📊 Tablas creadas:')
    tables.rows.forEach(t => console.log(`   - ${t.table_name}`))
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await client.end()
    console.log('🔌 Desconectado de la base de datos')
  }
}

ejecutarMigraciones()
