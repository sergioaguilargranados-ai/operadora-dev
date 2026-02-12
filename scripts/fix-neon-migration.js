const { Client } = require('pg');

const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 20000);

(async () => {
    await c.connect();
    console.log('Connected to Neon');

    // List existing tables
    const t = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'crm_%' ORDER BY table_name`);
    console.log('CRM tables:', t.rows.length);
    t.rows.forEach(r => console.log('  ', r.table_name));

    // Create crm_deep_links
    await c.query(`
        CREATE TABLE IF NOT EXISTS crm_deep_links (
            id SERIAL PRIMARY KEY,
            route_name VARCHAR(100) NOT NULL UNIQUE,
            web_path VARCHAR(255) NOT NULL,
            mobile_screen VARCHAR(100) NOT NULL,
            params_template JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('crm_deep_links table OK');

    // Insert deep links
    await c.query(`
        INSERT INTO crm_deep_links (route_name, web_path, mobile_screen) VALUES
        ('CRMDashboard', '/dashboard/crm', 'CRMDashboard'),
        ('CRMContactDetail', '/dashboard/crm/contacts/:id', 'CRMContactDetail'),
        ('CRMPipeline', '/dashboard/crm/pipeline', 'CRMPipeline'),
        ('CRMTasks', '/dashboard/crm/tasks', 'CRMTasks'),
        ('CRMCalendar', '/dashboard/crm/calendar', 'CRMCalendar'),
        ('CRMPredictive', '/dashboard/crm/predictive', 'CRMPredictive'),
        ('CRMWhatsApp', '/dashboard/crm/whatsapp', 'CRMWhatsApp'),
        ('CRMNotifications', '/dashboard/crm/notifications', 'CRMNotifications')
        ON CONFLICT (route_name) DO NOTHING
    `);
    console.log('Deep links inserted');

    // Create missing indexes
    await c.query('CREATE INDEX IF NOT EXISTS idx_campaign_stats_id ON crm_campaign_stats(campaign_id)');
    await c.query('CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON crm_campaign_events(campaign_id)');
    await c.query('CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON crm_campaign_events(event_type)');
    await c.query('CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON crm_ab_tests(status)');
    console.log('Sprint 10 indexes OK');

    // Final count
    const f = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'crm_%' ORDER BY table_name`);
    console.log('\n=== ALL DONE ===');
    console.log('Total CRM tables:', f.rows.length);
    f.rows.forEach(r => console.log('  ✓', r.table_name));

    await c.end();
    process.exit(0);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
