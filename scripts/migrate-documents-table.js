/**
 * migrate-documents-table.js
 * Crea la tabla 'documents' (migración 004) si no existe, 
 * luego aplica la extensión 040 para client documents.
 * 
 * Uso: node scripts/migrate-documents-table.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

setTimeout(() => { console.log('⏰ TIMEOUT'); process.exit(1); }, 60000);

(async () => {
    await c.connect();
    console.log('🔗 Conectado a Neon');

    // Verificar si documents ya existe
    const check = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='documents'`);

    if (check.rows.length > 0) {
        console.log('✅ Tabla documents ya existe');
    } else {
        // Crear tabla documents (migración 004)
        console.log('\n═══ Creando tabla documents (004) ═══');
        try {
            await c.query(`CREATE TABLE IF NOT EXISTS documents (
                id VARCHAR(255) PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
                document_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(500) NOT NULL,
                file_size INTEGER NOT NULL,
                file_type VARCHAR(100) NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                metadata JSONB,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                deleted_at TIMESTAMP,
                CONSTRAINT documents_file_size_check CHECK (file_size > 0 AND file_size <= 10485760)
            )`);
            console.log('  ✅ Tabla documents creada');
        } catch (e) { console.log('  ⚠️', e.message.substring(0, 120)); }

        // Índices
        const docIdxs = [
            `CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)`,
            `CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id)`,
            `CREATE INDEX IF NOT EXISTS idx_documents_booking_id ON documents(booking_id) WHERE booking_id IS NOT NULL`,
            `CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type)`,
            `CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC)`,
            `CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL`,
        ];
        for (const idx of docIdxs) { try { await c.query(idx); } catch (e) { } }
        console.log('  ✅ Índices documents creados');
    }

    // Ahora aplicar extensión 040
    console.log('\n═══ Aplicando extensión 040 ═══');

    // 1. Nuevas columnas
    try {
        await c.query(`ALTER TABLE documents
            ADD COLUMN IF NOT EXISTS agency_client_id INTEGER,
            ADD COLUMN IF NOT EXISTS crm_contact_id INTEGER,
            ADD COLUMN IF NOT EXISTS expiry_date DATE,
            ADD COLUMN IF NOT EXISTS document_number VARCHAR(100),
            ADD COLUMN IF NOT EXISTS issuing_country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(200),
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS verified_by INTEGER,
            ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
            ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'identification'
        `);
        console.log('  ✅ Columnas nuevas agregadas');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // 2. Actualizar constraint document_type
    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check`); } catch (e) { }
    try {
        await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_document_type_check CHECK (document_type IN (
            'passport','visa','id','driver_license','other','ine','curp','rfc','comprobante_domicilio',
            'acta_nacimiento','cedula_profesional','carta_poder','contrato','factura',
            'licencia_conducir','tarjeta_circulacion','poliza_seguro','certificado_medico',
            'foto_personal','comprobante_ingresos'
        ))`);
        console.log('  ✅ Constraint document_type actualizado');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // 3. Status & category constraints
    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check`); } catch (e) { }
    try { await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_status_check CHECK (status IN ('pending','approved','rejected','expired'))`); console.log('  ✅ Status constraint'); } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }
    try { await c.query(`ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_check`); } catch (e) { }
    try { await c.query(`ALTER TABLE documents ADD CONSTRAINT documents_category_check CHECK (category IN ('identification','legal','financial','medical','travel','other'))`); console.log('  ✅ Category constraint'); } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // 4. Índices
    const extIdxs = [
        `CREATE INDEX IF NOT EXISTS idx_documents_agency_client ON documents(agency_client_id) WHERE agency_client_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_crm_contact ON documents(crm_contact_id) WHERE crm_contact_id IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL`,
        `CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`,
        `CREATE INDEX IF NOT EXISTS idx_documents_verified ON documents(verified) WHERE verified = false`,
        `CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)`,
    ];
    for (const idx of extIdxs) { try { await c.query(idx); } catch (e) { } }
    console.log('  ✅ Índices extensión creados');

    // 5. Vista
    try {
        await c.query(`CREATE OR REPLACE VIEW client_documents_view AS
            SELECT d.id, d.document_type, d.file_name, d.file_size, d.file_type, d.url,
                d.description, d.document_number, d.issuing_country, d.expiry_date,
                d.status, d.category, d.verified, d.verified_at, d.created_at, d.updated_at,
                d.agency_client_id, d.crm_contact_id, d.user_id, d.tenant_id,
                ac.client_name, ac.client_email, ac.client_phone,
                CASE
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
                    WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'expiring_warning'
                    ELSE 'valid'
                END AS expiry_status
            FROM documents d
            LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
            WHERE d.deleted_at IS NULL`);
        console.log('  ✅ Vista client_documents_view');
    } catch (e) { console.log('  ⚠️ Vista:', e.message.substring(0, 100)); }

    // 6. Funciones
    try {
        await c.query(`CREATE OR REPLACE FUNCTION get_expiring_documents(p_tenant_id INTEGER, p_days_ahead INTEGER DEFAULT 30)
            RETURNS TABLE (document_id VARCHAR, document_type VARCHAR, file_name VARCHAR, expiry_date DATE,
                days_until_expiry INTEGER, agency_client_id INTEGER, client_name VARCHAR, client_email VARCHAR)
            AS $fn$
            BEGIN RETURN QUERY
                SELECT d.id AS document_id, d.document_type, d.file_name, d.expiry_date,
                    (d.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry,
                    ac.id AS agency_client_id, ac.client_name, ac.client_email
                FROM documents d
                LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
                WHERE d.tenant_id = p_tenant_id AND d.deleted_at IS NULL
                    AND d.expiry_date IS NOT NULL
                    AND d.expiry_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
                    AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY d.expiry_date ASC;
            END; $fn$ LANGUAGE plpgsql`);
        console.log('  ✅ Función get_expiring_documents');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    try {
        await c.query(`CREATE OR REPLACE FUNCTION get_client_documents(p_agency_client_id INTEGER)
            RETURNS TABLE (id VARCHAR, document_type VARCHAR, file_name VARCHAR, file_size INTEGER,
                expiry_date DATE, status VARCHAR, category VARCHAR, verified BOOLEAN,
                created_at TIMESTAMP, expiry_status TEXT)
            AS $fn$
            BEGIN RETURN QUERY
                SELECT d.id, d.document_type, d.file_name, d.file_size, d.expiry_date,
                    d.status, d.category, d.verified, d.created_at,
                    CASE
                        WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
                        WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
                        ELSE 'valid'
                    END AS expiry_status
                FROM documents d
                WHERE d.agency_client_id = p_agency_client_id AND d.deleted_at IS NULL
                ORDER BY d.created_at DESC;
            END; $fn$ LANGUAGE plpgsql`);
        console.log('  ✅ Función get_client_documents');
    } catch (e) { console.log('  ⚠️', e.message.substring(0, 100)); }

    // Verificación
    console.log('\n═══ VERIFICACIÓN ═══');
    const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='documents' AND column_name IN ('agency_client_id','expiry_date','category','status','verified') ORDER BY column_name`);
    console.log(`📄 Columnas nuevas en documents: ${cols.rows.length}`);
    cols.rows.forEach(r => console.log(`   ✓ ${r.column_name}`));

    const views = await c.query(`SELECT table_name FROM information_schema.views WHERE table_schema='public' AND table_name LIKE 'client_%'`);
    console.log(`👁️ Vistas: ${views.rows.length}`);
    views.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    const funcs = await c.query(`SELECT routine_name FROM information_schema.routines WHERE routine_schema='public' AND (routine_name LIKE 'get_expiring%' OR routine_name LIKE 'get_client%')`);
    console.log(`⚙️ Funciones: ${funcs.rows.length}`);
    funcs.rows.forEach(r => console.log(`   ✓ ${r.routine_name}`));

    console.log('\n🎉 ¡Migración 004 + 040 completada!');
    await c.end();
    process.exit(0);
})().catch(e => { console.error('💥', e.message); process.exit(1); });
