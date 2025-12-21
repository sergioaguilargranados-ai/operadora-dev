const { query } = require('./src/lib/db.ts')
const bcrypt = require('bcryptjs')

async function updatePasswords() {
  try {
    console.log('🔐 Generando nuevo hash para Password123!...\n')
    
    // Generar hash correcto
    const hash = await bcrypt.hash('Password123!', 10)
    
    // Verificar que funciona
    const isValid = await bcrypt.compare('Password123!', hash)
    if (!isValid) {
      throw new Error('Hash no válido!')
    }
    
    console.log('✅ Hash generado:', hash)
    console.log('✅ Verificación:', isValid ? 'OK' : 'FAIL')
    
    // Actualizar TODOS los usuarios
    const result = await query(
      'UPDATE users SET password_hash = $1',
      [hash]
    )
    
    console.log(`\n✅ ${result.rowCount} usuarios actualizados`)
    
    // Verificar
    const users = await query(`
      SELECT id, email, full_name, role 
      FROM users 
      ORDER BY id
    `)
    
    console.log('\n📧 Usuarios en Producción (Neon):')
    console.table(users.rows)
    
    console.log('\n🔑 Password para TODOS: Password123!')
    console.log('✅ Listo para probar login en app.asoperadora.com')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

updatePasswords()
