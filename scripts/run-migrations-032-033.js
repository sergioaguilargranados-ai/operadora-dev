// Script temporal para ejecutar migraciones 032 y 033
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function run() {
    const client = new Client(DATABASE_URL);
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // --- Migración 032 ---
    console.log('🔄 Ejecutando migración 032: Markup fields...');
    await client.query(`
        ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_percentage DECIMAL(5,2) DEFAULT 0.00;
    `);
    await client.query(`
        ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_fixed DECIMAL(10,2) DEFAULT 0.00;
    `);
    await client.query(`
        ALTER TABLE white_label_config ADD COLUMN IF NOT EXISTS markup_type VARCHAR(20) DEFAULT 'percentage';
    `);
    console.log('✅ Migración 032 completada\n');

    // --- Migración 033 ---
    console.log('🔄 Ejecutando migración 033: agency_applications table...');
    await client.query(`
        CREATE TABLE IF NOT EXISTS agency_applications (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            legal_name VARCHAR(255),
            tax_id VARCHAR(50),
            contact_name VARCHAR(255) NOT NULL,
            contact_email VARCHAR(255) NOT NULL UNIQUE,
            contact_phone VARCHAR(50) NOT NULL,
            website VARCHAR(500),
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100) DEFAULT 'México',
            description TEXT,
            expected_monthly_bookings VARCHAR(50),
            ip_address VARCHAR(50),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
            reviewed_by INTEGER REFERENCES users(id),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            review_notes TEXT,
            tenant_id INTEGER REFERENCES tenants(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agency_applications_status ON agency_applications(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agency_applications_email ON agency_applications(contact_email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agency_applications_created ON agency_applications(created_at DESC);`);
    console.log('✅ Migración 033 completada\n');

    // Verificar
    const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'white_label_config' AND column_name IN ('markup_percentage','markup_fixed','markup_type')
        ORDER BY column_name;
    `);
    console.log('📋 Columnas de markup en white_label_config:', cols.rows.map(r => r.column_name).join(', '));

    const tbl = await client.query(`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agency_applications') as exists;
    `);
    console.log('📋 Tabla agency_applications existe:', tbl.rows[0].exists);

    await client.end();
    console.log('\n🎉 Todas las migraciones ejecutadas correctamente');
}

run().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
