const { query } = require('./src/lib/db.ts')
const bcrypt = require('bcryptjs')

async function verifySergio() {
  try {
    const sergio = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      ['sergio.aguilar.granados@gmail.com']
    )
    
    if (sergio.rows.length === 0) {
      console.log('❌ sergio.aguilar.granados@gmail.com NO existe')
      process.exit(1)
    }
    
    console.log('✅ Usuario encontrado:')
    console.log('   ID:', sergio.rows[0].id)
    console.log('   Email:', sergio.rows[0].email)
    console.log('   Nombre:', sergio.rows[0].name)
    
    // Verificar password
    const match = await bcrypt.compare('Password123!', sergio.rows[0].password_hash)
    console.log('\n🔐 Password Password123!:', match ? '✅ CORRECTO' : '❌ INCORRECTO')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

verifySergio()
