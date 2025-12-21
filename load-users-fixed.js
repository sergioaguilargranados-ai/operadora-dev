const { query } = require('./src/lib/db.ts')

async function loadUsers() {
  try {
    const password = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WFWnQ53k9MkVlz2E6E4Ky'

    const users = [
      { email: 'superadmin@asoperadora.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
      { email: 'admin@asoperadora.com', name: 'Admin', role: 'ADMIN' },
      { email: 'manager@empresa.com', name: 'Manager Principal', role: 'MANAGER' },
      { email: 'maria.garcia@empresa.com', name: 'Maria Garcia', role: 'MANAGER' },
      { email: 'empleado@empresa.com', name: 'Empleado Uno', role: 'EMPLOYEE' },
      { email: 'juan.perez@empresa.com', name: 'Juan Perez', role: 'EMPLOYEE' },
    ]

    for (const user of users) {
      const result = await query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         ON CONFLICT (email) DO NOTHING
         RETURNING email`,
        [user.email, password, user.name, user.role]
      )

      if (result.rows.length > 0) {
        console.log('✅ Usuario creado:', user.email)
      } else {
        console.log('ℹ️  Usuario ya existe:', user.email)
      }
    }

    console.log('\n✅ Proceso completado')
    console.log('📧 Usuarios disponibles:')
    users.forEach(u => console.log(`   - ${u.email}`))
    console.log('\n🔑 Password para todos: Password123!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

loadUsers()
