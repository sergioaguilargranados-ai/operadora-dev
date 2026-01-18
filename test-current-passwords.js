const { query } = require('./src/lib/db.ts')
const bcrypt = require('bcryptjs')

async function testPasswords() {
  try {
    console.log('🔐 Probando passwords actuales con Password123!...\n')
    
    const users = await query(`
      SELECT id, email, password_hash 
      FROM users 
      ORDER BY id 
      LIMIT 5
    `)
    
    for (const user of users.rows) {
      const match = await bcrypt.compare('Password123!', user.password_hash)
      console.log(`${match ? '✅' : '❌'} ${user.email}: ${match ? 'OK' : 'INCORRECTO'}`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testPasswords()
