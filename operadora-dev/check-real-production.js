const { query } = require('./src/lib/db.ts')

async function checkRealProduction() {
  try {
    console.log('📊 Conectando a BD de producción REAL...\n')
    
    // Ver usuarios
    const users = await query(`
      SELECT id, email, name 
      FROM users 
      ORDER BY id
    `)
    
    console.log('👥 TODOS los usuarios en producción:')
    console.table(users.rows)
    
    console.log('\n✅ Total:', users.rows.length, 'usuarios')
    
    // Verificar sergio
    const sergio = users.rows.find(u => u.email === 'sergio.aguilar.granados@gmail.com')
    console.log('\n🔍 sergio.aguilar.granados@gmail.com:', sergio ? '✅ EXISTE' : '❌ NO EXISTE')
    
    if (sergio) {
      console.log('   ID:', sergio.id)
      console.log('   Nombre:', sergio.name)
    }
    
    // Ver un password de ejemplo
    const firstUser = await query(`
      SELECT email, password_hash 
      FROM users 
      ORDER BY id 
      LIMIT 1
    `)
    
    console.log('\n🔐 Ejemplo de hash actual:')
    console.log('   Usuario:', firstUser.rows[0].email)
    console.log('   Hash:', firstUser.rows[0].password_hash.substring(0, 30) + '...')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkRealProduction()
