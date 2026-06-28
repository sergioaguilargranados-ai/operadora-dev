const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function getSchemas() {
  const tables = ['users', 'tenants', 'hr_employees', 'crm_contacts', 'roles', 'entity_documents', 'tenant_users'];
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    console.log(`\nTable: ${table}`);
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  }
  pool.end();
}
getSchemas();
