const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    console.log('Starting migration for communication settings...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS communication_settings (
        tenant_id INTEGER PRIMARY KEY,
        moderation_enabled BOOLEAN DEFAULT true,
        daily_message_limit INTEGER DEFAULT 100,
        retention_days INTEGER DEFAULT 2555
      );
    `);
    
    // Insert default settings for tenant 1
    await pool.query(`
      INSERT INTO communication_settings (tenant_id, moderation_enabled, daily_message_limit, retention_days)
      VALUES (1, false, 1000, 2555)
      ON CONFLICT (tenant_id) DO NOTHING;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS communication_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT false,
        whatsapp_enabled BOOLEAN DEFAULT true,
        in_app_enabled BOOLEAN DEFAULT true,
        email_address VARCHAR(255),
        phone_number VARCHAR(50),
        whatsapp_number VARCHAR(50),
        booking_confirmations BOOLEAN DEFAULT true,
        payment_reminders BOOLEAN DEFAULT true,
        itinerary_changes BOOLEAN DEFAULT true,
        promotional BOOLEAN DEFAULT false,
        quiet_hours_enabled BOOLEAN DEFAULT false,
        quiet_hours_start VARCHAR(10),
        quiet_hours_end VARCHAR(10),
        timezone VARCHAR(50) DEFAULT 'America/Mexico_City'
      );
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrate();
