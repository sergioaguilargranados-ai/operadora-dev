const { query } = require('./src/lib/db.ts')

async function checkAllDBs() {
  try {
    const dbs = await query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `)
    
    console.log('📊 Bases de datos disponibles en este endpoint:\n')
    dbs.rows.forEach(db => console.log(`   - ${db.datname}`))
    
    console.log('\n✅ Total:', dbs.rows.length, 'bases de datos')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkAllDBs()
