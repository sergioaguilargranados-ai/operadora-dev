const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Starting migration to add tenant_id to users...");
    
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='tenant_id';
    `;
    const checkRes = await pool.query(checkQuery);
    
    if (checkRes.rows.length === 0) {
      console.log("Adding tenant_id column to users table...");
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) DEFAULT 1;
      `);
      console.log("Column added successfully.");
      
      console.log("Updating existing users to have tenant_id based on tenant_users if available...");
      // For users that are agents, they might already have a link in tenant_users
      await pool.query(`
        UPDATE users u
        SET tenant_id = tu.tenant_id
        FROM tenant_users tu
        WHERE u.id = tu.user_id;
      `);
      console.log("Existing users updated.");
    } else {
      console.log("Column tenant_id already exists in users table.");
    }
    
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
