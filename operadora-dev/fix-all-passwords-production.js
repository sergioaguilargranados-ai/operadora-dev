const { query } = require('./src/lib/db.ts')
const bcrypt = require('bcryptjs')

async function fixAllPasswords() {
  try {
    console.log('🔐 Generando hash correcto para Password123!...\n')
    
    // Generar hash
    const hash = await bcrypt.hash('Password123!', 10)
    
    // Verificar que funciona
    const isValid = await bcrypt.compare('Password123!', hash)
    if (!isValid) {
      throw new Error('Hash inválido!')
    }
    
    console.log('✅ Hash generado y verificado:', hash.substring(0, 30) + '...')
    
    // Actualizar TODOS los usuarios
    const result = await query(
      'UPDATE users SET password_hash = $1',
      [hash]
    )
    
    console.log(`\n✅ ${result.rowCount} usuarios actualizados`)
    
    // Verificar algunos usuarios
    const testUsers = await query(`
      SELECT id, email 
      FROM users 
      ORDER BY id 
      LIMIT 5
    `)
    
    console.log('\n📧 Primeros 5 usuarios actualizados:')
    testUsers.rows.forEach(u => console.log(`   ${u.id}. ${u.email}`))
    
    console.log('\n🔑 Password para TODOS: Password123!')
    console.log('✅ Listo para probar en app.asoperadora.com')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fixAllPasswords()
