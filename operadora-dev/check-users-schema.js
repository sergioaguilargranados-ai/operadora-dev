const { query } = require('./src/lib/db.ts')

async function checkUsersSchema() {
  try {
    // Ver columnas de users
    console.log('📊 Estructura de la tabla users:')
    const columns = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `)

    console.table(columns.rows)

    // Listar usuarios
    console.log('\n👥 Usuarios en la base de datos:')
    const users = await query('SELECT id, email, full_name, role, is_active FROM users')
    console.table(users.rows)

    console.log('\n✅ Total de usuarios:', users.rows.length)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUsersSchema()
