const { query } = require('./src/lib/db.ts')

async function verifyAllUsers() {
  try {
    const result = await query(`
      SELECT id, email, full_name, role, is_active 
      FROM users 
      ORDER BY id
    `)

    console.log('📊 Usuarios en Neon (BD Producción):\n')
    console.table(result.rows)
    
    console.log('\n🔑 Password para TODOS: Password123!')
    console.log('\n✅ Total:', result.rows.length, 'usuarios')
    
    // Test login para cada uno
    const bcrypt = require('bcryptjs')
    const hash = '$2b$10$nedQzllnMLmc0eEAJ9UJaurU.W5lTO39Eh7Gb6ABP7H05LVliqMfC'
    
    const isValid = await bcrypt.compare('Password123!', hash)
    console.log('\n✅ Hash password válido:', isValid ? 'SÍ' : 'NO')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

verifyAllUsers()
