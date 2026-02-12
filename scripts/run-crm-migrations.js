const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
});

(async () => {
    await client.connect();
    console.log('Connected');

    // Check columns on crm_contacts
    const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='crm_contacts' ORDER BY ordinal_position`);
    console.log('crm_contacts columns:', cols.rows.map(r => r.column_name).join(', '));

    // Add missing columns if needed
    const colNames = cols.rows.map(r => r.column_name);

    if (!colNames.includes('score')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN score INTEGER DEFAULT 0`);
        console.log('+ Added score column');
    }
    if (!colNames.includes('destination_interest')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN destination_interest VARCHAR(255)`);
        console.log('+ Added destination_interest');
    }
    if (!colNames.includes('travel_date')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN travel_date DATE`);
        console.log('+ Added travel_date');
    }
    if (!colNames.includes('budget')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN budget DECIMAL(10,2)`);
        console.log('+ Added budget');
    }
    if (!colNames.includes('travel_type')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN travel_type VARCHAR(50)`);
        console.log('+ Added travel_type');
    }
    if (!colNames.includes('tags')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN tags TEXT[]`);
        console.log('+ Added tags');
    }
    if (!colNames.includes('custom_fields')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN custom_fields JSONB DEFAULT '{}'`);
        console.log('+ Added custom_fields');
    }
    if (!colNames.includes('last_interaction_at')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN last_interaction_at TIMESTAMP`);
        console.log('+ Added last_interaction_at');
    }
    if (!colNames.includes('next_followup_at')) {
        await client.query(`ALTER TABLE crm_contacts ADD COLUMN next_followup_at TIMESTAMP`);
        console.log('+ Added next_followup_at');
    }

    // Indexes (safe with IF NOT EXISTS)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_contacts_score ON crm_contacts(score DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_contacts_agent ON crm_contacts(assigned_agent_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON crm_tasks(due_date)`);
    console.log('Indexes OK');

    // Sprint 10 tables
    await client.query(`
        CREATE TABLE IF NOT EXISTS crm_campaign_stats (
            id SERIAL PRIMARY KEY,
            campaign_id VARCHAR(100) NOT NULL,
            template_name VARCHAR(100),
            total_sent INTEGER DEFAULT 0,
            total_delivered INTEGER DEFAULT 0,
            total_opened INTEGER DEFAULT 0,
            total_clicked INTEGER DEFAULT 0,
            total_bounced INTEGER DEFAULT 0,
            total_unsubscribed INTEGER DEFAULT 0,
            open_rate DECIMAL(5,2) DEFAULT 0,
            click_rate DECIMAL(5,2) DEFAULT 0,
            bounce_rate DECIMAL(5,2) DEFAULT 0,
            ctr DECIMAL(5,2) DEFAULT 0,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('crm_campaign_stats OK');

    await client.query(`
        CREATE TABLE IF NOT EXISTS crm_campaign_events (
            id SERIAL PRIMARY KEY,
            campaign_id VARCHAR(100) NOT NULL,
            contact_id INTEGER,
            event_type VARCHAR(50) NOT NULL,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('crm_campaign_events OK');

    await client.query(`
        CREATE TABLE IF NOT EXISTS crm_ab_tests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            campaign_a_id VARCHAR(100),
            campaign_b_id VARCHAR(100),
            test_type VARCHAR(50) DEFAULT 'template',
            winning_criteria VARCHAR(50) DEFAULT 'open_rate',
            winner VARCHAR(10),
            confidence DECIMAL(5,2),
            status VARCHAR(20) DEFAULT 'running',
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('crm_ab_tests OK');

    await client.query(`
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
    await client.query(`
        INSERT INTO crm_deep_links (route_name, web_path, mobile_screen, params_template) VALUES
        ('CRMDashboard', '/dashboard/crm', 'CRMDashboard', '{}'),
        ('CRMContactDetail', '/dashboard/crm/contacts/:id', 'CRMContactDetail', '{"id":"number"}'),
        ('CRMPipeline', '/dashboard/crm/pipeline', 'CRMPipeline', '{}'),
        ('CRMTasks', '/dashboard/crm/tasks', 'CRMTasks', '{}'),
        ('CRMCalendar', '/dashboard/crm/calendar', 'CRMCalendar', '{}'),
        ('CRMPredictive', '/dashboard/crm/predictive', 'CRMPredictive', '{}'),
        ('CRMWhatsApp', '/dashboard/crm/whatsapp', 'CRMWhatsApp', '{}'),
        ('CRMNotifications', '/dashboard/crm/notifications', 'CRMNotifications', '{}')
        ON CONFLICT (route_name) DO NOTHING
    `);
    console.log('crm_deep_links OK + 8 links');

    // Sprint 10 indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_campaign_stats_id ON crm_campaign_stats(campaign_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON crm_campaign_events(campaign_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON crm_campaign_events(event_type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON crm_ab_tests(status)`);
    console.log('Sprint 10 indexes OK');

    // Final verification
    const final = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'crm_%' ORDER BY table_name`);
    console.log('\n=== DONE ===');
    console.log('Total CRM tables:', final.rows.length);
    final.rows.forEach(r => console.log('  ✓', r.table_name));

    await client.end();
})().catch(e => { console.error('FATAL:', e.message); client.end(); });
