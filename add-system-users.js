const { query } = require('./src/lib/db.ts')
const bcrypt = require('bcryptjs')

async function addSystemUsers() {
  try {
    console.log('👥 Agregando usuarios del sistema...\n')

    const password = await bcrypt.hash('Password123!', 10)

    const users = [
      { email: 'superadmin@asoperadora.com', name: 'Super Admin' },
      { email: 'admin2@asoperadora.com', name: 'Admin Secundario' },
      { email: 'manager@empresa.com', name: 'Manager Principal' },
      { email: 'empleado@empresa.com', name: 'Empleado Uno' },
      { email: 'juan.perez@empresa.com', name: 'Juan Pérez' },
      { email: 'maria.garcia@empresa.com', name: 'María García' }
    ]

    for (const user of users) {
      try {
        const result = await query(
          `INSERT INTO users (email, name, password_hash, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, true, NOW(), NOW())
           RETURNING id, email, name`,
          [user.email, user.name, password]
        )

        console.log(`✅ ${result.rows[0].id}. ${user.email}`)
      } catch (error) {
        if (error.message.includes('duplicate')) {
          console.log(`ℹ️  ${user.email} ya existe (omitido)`)
        } else {
          console.error(`❌ Error con ${user.email}:`, error.message)
        }
      }
    }

    // Ver total ahora
    const total = await query('SELECT COUNT(*) as total FROM users')
    console.log(`\n✅ Total usuarios en BD: ${total.rows[0].total}`)

    // Agregar sergio
    console.log('\n📧 Agregando sergio.aguilar.granados@gmail.com...')

    try {
      const sergio = await query(
        `INSERT INTO users (email, name, password_hash, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         RETURNING id, email, name`,
        ['sergio.aguilar.granados@gmail.com', 'Sergio Aguilar Granados', password]
      )

      console.log(`✅ ${sergio.rows[0].id}. sergio.aguilar.granados@gmail.com`)
    } catch (error) {
      if (error.message.includes('duplicate')) {
        console.log('ℹ️  sergio.aguilar.granados@gmail.com ya existe')
      } else {
        console.error('❌ Error:', error.message)
      }
    }

    console.log('\n🔑 Password para TODOS: Password123!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

addSystemUsers()
