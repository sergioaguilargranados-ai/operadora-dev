const { query } = require('./src/lib/db.ts')

async function listAllUsers() {
  try {
    const users = await query(`
      SELECT id, email, full_name, role, is_active, created_at
      FROM users 
      ORDER BY id
    `)
    
    console.log('📊 TODOS los usuarios en esta BD:\n')
    console.table(users.rows)
    
    console.log('\n✅ Total:', users.rows.length, 'usuarios')
    
    // Verificar si existe sergio.aguilar.granados@gmail.com
    const sergio = users.rows.find(u => u.email === 'sergio.aguilar.granados@gmail.com')
    console.log('\n🔍 sergio.aguilar.granados@gmail.com:', sergio ? '✅ EXISTE' : '❌ NO EXISTE')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

listAllUsers()
