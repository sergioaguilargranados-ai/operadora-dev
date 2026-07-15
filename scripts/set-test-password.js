require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const email = 'c@c.com';
    const rawPassword = 'password123';
    
    // Hash password
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    
    // Update user
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, password_hash',
      [passwordHash, email]
    );
    
    if (res.rows.length > 0) {
      console.log(`Successfully updated password for ${email}. New password is: ${rawPassword}`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    pool.end();
  }
}

main();
