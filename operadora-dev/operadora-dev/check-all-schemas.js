const { query } = require('./src/lib/db.ts')

async function checkSchemas() {
  try {
    // Ver todos los schemas
    const schemas = await query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `)
    
    console.log('📊 Schemas disponibles:')
    schemas.rows.forEach(s => console.log(`   - ${s.schema_name}`))
    
    // Ver tablas en cada schema
    for (const schema of schemas.rows) {
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = 'users'
      `, [schema.schema_name])
      
      if (tables.rows.length > 0) {
        console.log(`\n👥 Schema "${schema.schema_name}" tiene tabla users`)
        
        // Contar usuarios
        const count = await query(`
          SELECT COUNT(*) as total FROM "${schema.schema_name}".users
        `)
        console.log(`   Total usuarios: ${count.rows[0].total}`)
        
        // Primeros 5
        const sample = await query(`
          SELECT id, email FROM "${schema.schema_name}".users 
          ORDER BY id LIMIT 5
        `)
        console.log('   Primeros 5:')
        sample.rows.forEach(u => console.log(`     ${u.id}. ${u.email}`))
      }
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkSchemas()
