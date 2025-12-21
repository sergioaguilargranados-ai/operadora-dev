const { query } = require('./src/lib/db.ts')

async function checkSchema() {
  try {
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    console.log('📊 Columnas de la tabla users:\n')
    console.table(columns.rows)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkSchema()
