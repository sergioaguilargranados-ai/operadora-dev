require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('1. Modificando tabla users...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS wants_insurance BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS facebook_user VARCHAR(255),
      ADD COLUMN IF NOT EXISTS instagram_user VARCHAR(255),
      ADD COLUMN IF NOT EXISTS tiktok_user VARCHAR(255);
    `);

    console.log('2. Creando tabla client_documents...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        file_url VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('3. Creando tabla invitations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        social_network VARCHAR(50) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        message TEXT,
        invite_image_url VARCHAR(1000),
        status VARCHAR(50) DEFAULT 'sent',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('4. Creando tabla products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        features_json JSONB,
        image_url VARCHAR(1000),
        stock INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('5. Creando tabla orders...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_id VARCHAR(255),
        items_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('6. Modificando tabla tenants...');
    await client.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS logo_dark_url VARCHAR(1000);
    `);

    console.log('7. Creando tabla rewards_progress...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards_progress (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        current_steps INTEGER DEFAULT 0,
        badges_json JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Migración completada exitosamente.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error durante migración:', e);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
