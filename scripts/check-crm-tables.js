const { Pool } = require('pg');

async function run() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        // Check current columns on crm_contacts
        const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'crm_contacts' ORDER BY ordinal_position
    `);
        console.log('crm_contacts columns:', cols.rows.map(r => r.column_name).join(', '));

        // Check all existing CRM tables
        const tables = await pool.query(`SELECT tablename FROM pg_tables WHERE tablename LIKE 'crm_%' ORDER BY tablename`);
        console.log('CRM tables:', tables.rows.map(r => r.tablename).join(', '));

        // Drop crm_pipeline if it exists (wrong name, should be crm_pipeline_stages)
        // Check if crm_pipeline_stages exists or just crm_pipeline
        const pipelineCheck = await pool.query(`SELECT tablename FROM pg_tables WHERE tablename IN ('crm_pipeline', 'crm_pipeline_stages')`);
        console.log('Pipeline tables:', pipelineCheck.rows.map(r => r.tablename).join(', '));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

run();
