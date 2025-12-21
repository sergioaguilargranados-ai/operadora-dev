const { query } = require('./src/lib/db.ts')

async function checkDB() {
  try {
    // Ver nombre de la BD actual
    const dbName = await query('SELECT current_database()')
    console.log('📊 Base de datos actual:', dbName.rows[0].current_database)

    // Ver host
    const host = await query('SELECT inet_server_addr()')
    console.log('🌐 Host:', host.rows[0].inet_server_addr || 'localhost')

    // Ver usuarios
    const users = await query('SELECT id, email FROM users ORDER BY id')
    console.log('\n👥 Usuarios en esta BD:')
    users.rows.forEach(u => console.log(`   ${u.id}. ${u.email}`))

    console.log('\n✅ Total:', users.rows.length, 'usuarios')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkDB()
