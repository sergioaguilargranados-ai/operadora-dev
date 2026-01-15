const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
  try {
    const result = await pool.query(
      "SELECT email, password IS NOT NULL as has_password, LENGTH(password) as pwd_length FROM users WHERE email LIKE '%asoperadora%' OR email LIKE '%empresa%' LIMIT 10"
    );
    
    console.log('\n🔍 USUARIOS EN BD:');
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
