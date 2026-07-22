require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const tuColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tenant_users'");
    console.log('Columns in tenant_users:', tuColumns.rows.map(r => r.column_name));
    
    // Check if c@c.com (user_id 42) is in tenant_users
    const tuQuery = await pool.query("SELECT * FROM tenant_users WHERE user_id = 42 OR user_id = 44");
    console.log('tenant_users for 42 and 44:', tuQuery.rows);

    const acColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'agency_clients'");
    console.log('Columns in agency_clients:', acColumns.rows.map(r => r.column_name));
    
    if (acColumns.rows.length > 0) {
      const acQuery = await pool.query("SELECT * FROM agency_clients WHERE user_id = 42 OR user_id = 44 OR referred_by_agent_id = 42");
      console.log('agency_clients records:', acQuery.rows);
    }
    
    // Also check referral_conversions schema
    const rcColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'referral_conversions'");
    console.log('Columns in referral_conversions:', rcColumns.rows.map(r => r.column_name));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
