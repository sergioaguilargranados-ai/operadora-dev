require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function enableAllFeatures() {
  try {
    console.log('Habilitando todos los features...');
    
    const result = await pool.query(`
      UPDATE features 
      SET is_global_enabled = true, 
          web_enabled = true, 
          mobile_enabled = true
    `);
    
    console.log(`Se habilitaron ${result.rowCount} features globalmente.`);
    
    const roleResult = await pool.query(`
      UPDATE feature_role_access 
      SET web_enabled = true, 
          mobile_enabled = true
    `);
    
    console.log(`Se actualizaron ${roleResult.rowCount} accesos por rol.`);
    
    // Disable mandatory login just in case it breaks testing
    // or maybe they want to test everything without being forced to login on every screen
    // await pool.query(`UPDATE app_settings SET value = 'false' WHERE key LIKE 'LOGIN_REQUIRED%'`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

enableAllFeatures();
