const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration(fileName) {
  try {
    console.log(`--- Running Migration: ${fileName} ---`);
    const sql = fs.readFileSync(path.join(__dirname, `../migrations/${fileName}`), 'utf-8');
    await pool.query(sql);
    console.log(`✅ Migration ${fileName} completed successfully.`);
  } catch (error) {
    console.error(`❌ Error applying migration ${fileName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    await runMigration('061_corporate_advanced.sql');
    await runMigration('061_tenant_settings.sql');
    await runMigration('062_add_appearance_fields_to_tenants.sql');
    console.log('✅ All remaining migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration process failed.');
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
