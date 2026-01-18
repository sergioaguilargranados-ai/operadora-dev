const { query } = require('./src/lib/db.ts')

async function fixPasswords() {
  try {
    // Hash correcto para Password123!
    const correctHash = '$2b$10$nedQzllnMLmc0eEAJ9UJaurU.W5lTO39Eh7Gb6ABP7H05LVliqMfC'

    const result = await query(
      'UPDATE users SET password_hash = $1',
      [correctHash]
    )

    console.log(`✅ ${result.rowCount} usuarios actualizados`)
    console.log('🔑 Password para todos: Password123!')

    // Verificar
    const users = await query('SELECT email FROM users LIMIT 6')
    console.log('\n📧 Usuarios actualizados:')
    users.rows.forEach(u => console.log(`   - ${u.email}`))

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixPasswords()
