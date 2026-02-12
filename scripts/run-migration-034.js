const { Pool } = require('pg');

async function run() {
    const pool = new Pool({
        connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        // Helper: safely add column
        const addColumn = async (table, col, type, defaultVal) => {
            try {
                const def = defaultVal !== undefined && defaultVal !== null ? ` DEFAULT ${defaultVal}` : '';
                await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}${def}`);
                return true;
            } catch (e) {
                console.log(`  ⚠ ${table}.${col}: ${e.message.substring(0, 80)}`);
                return false;
            }
        };

        // Helper: safely create index
        const createIndex = async (sql) => {
            try {
                await pool.query(sql);
            } catch (e) {
                // Ignore index creation errors
            }
        };

        // ══════════════════════════════════════
        // 1. PIPELINE STAGES TABLE
        // ══════════════════════════════════════
        const hasPipelineStages = await pool.query(`SELECT 1 FROM pg_tables WHERE tablename = 'crm_pipeline_stages'`);
        if (hasPipelineStages.rows.length === 0) {
            await pool.query('DROP TABLE IF EXISTS crm_pipeline CASCADE');
            await pool.query(`
        CREATE TABLE crm_pipeline_stages (
          id SERIAL PRIMARY KEY,
          tenant_id INTEGER,
          stage_key VARCHAR(50) NOT NULL,
          stage_label VARCHAR(100) NOT NULL,
          stage_order INTEGER NOT NULL,
          color VARCHAR(7) DEFAULT '#6B7280',
          icon VARCHAR(50) DEFAULT '📋',
          auto_task_template JSONB,
          sla_hours INTEGER,
          is_active BOOLEAN DEFAULT true,
          is_default BOOLEAN DEFAULT false,
          is_win_stage BOOLEAN DEFAULT false,
          is_loss_stage BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
            await pool.query(`
        INSERT INTO crm_pipeline_stages (tenant_id, stage_key, stage_label, stage_order, color, icon, is_default, is_win_stage, is_loss_stage) VALUES
          (NULL, 'new',         'Nuevo',        1,  '#94A3B8', '🆕', true,  false, false),
          (NULL, 'qualified',   'Calificado',   2,  '#3B82F6', '✅', false, false, false),
          (NULL, 'quoted',      'Cotizado',     3,  '#8B5CF6', '💰', false, false, false),
          (NULL, 'negotiation', 'Negociación',  4,  '#F59E0B', '🤝', false, false, false),
          (NULL, 'reserved',    'Reservado',    5,  '#10B981', '📅', false, false, false),
          (NULL, 'paid',        'Pagado',       6,  '#059669', '💳', false, false, false),
          (NULL, 'traveling',   'Viajando',     7,  '#06B6D4', '✈️', false, false, false),
          (NULL, 'post_trip',   'Post-Viaje',   8,  '#8B5CF6', '⭐', false, false, false),
          (NULL, 'won',         'Ganado',       9,  '#22C55E', '🏆', false, true,  false),
          (NULL, 'lost',        'Perdido',      10, '#EF4444', '❌', false, false, true)
      `);
            console.log('✅ crm_pipeline_stages created with 10 stages');
        } else {
            console.log('✅ crm_pipeline_stages already exists');
        }

        // ══════════════════════════════════════
        // 2. ALTER crm_contacts
        // ══════════════════════════════════════
        console.log('\n📋 Updating crm_contacts...');
        const contactCols = [
            ['agency_client_id', 'INTEGER', null],
            ['whatsapp', 'VARCHAR(50)', null],
            ['avatar_url', 'TEXT', null],
            ['source_detail', 'VARCHAR(500)', null],
            ['utm_source', 'VARCHAR(100)', null],
            ['utm_medium', 'VARCHAR(100)', null],
            ['utm_campaign', 'VARCHAR(100)', null],
            ['pipeline_stage', 'VARCHAR(50)', "'new'"],
            ['stage_changed_at', 'TIMESTAMP', 'NOW()'],
            ['days_in_stage', 'INTEGER', '0'],
            ['lost_reason', 'VARCHAR(500)', null],
            ['lead_score', 'INTEGER', '0'],
            ['score_signals', 'JSONB', "'{}'"],
            ['is_hot_lead', 'BOOLEAN', 'false'],
            ['assigned_agent_id', 'INTEGER', null],
            ['assigned_at', 'TIMESTAMP', null],
            ['last_agent_contact_at', 'TIMESTAMP', null],
            ['interested_destination', 'VARCHAR(200)', null],
            ['travel_dates_start', 'DATE', null],
            ['travel_dates_end', 'DATE', null],
            ['num_travelers', 'INTEGER', null],
            ['budget_min', 'NUMERIC(12,2)', null],
            ['budget_max', 'NUMERIC(12,2)', null],
            ['budget_currency', "VARCHAR(3)", "'MXN'"],
            ['travel_type', 'VARCHAR(50)', null],
            ['special_requirements', 'TEXT', null],
            ['total_bookings', 'INTEGER', '0'],
            ['total_quotes', 'INTEGER', '0'],
            ['total_interactions', 'INTEGER', '0'],
            ['first_contact_at', 'TIMESTAMP', 'NOW()'],
            ['last_contact_at', 'TIMESTAMP', null],
            ['next_followup_at', 'TIMESTAMP', null],
            ['last_booking_at', 'TIMESTAMP', null],
            ['birthday', 'DATE', null],
            ['tags', 'TEXT[]', "'{}'"],
            ['custom_fields', 'JSONB', "'{}'"],
            ['notes', 'TEXT', null],
        ];
        let added = 0;
        for (const [col, type, def] of contactCols) {
            if (await addColumn('crm_contacts', col, type, def)) added++;
        }
        console.log(`  → ${added} columns processed`);

        // Migrate old data
        try {
            await pool.query(`UPDATE crm_contacts SET assigned_agent_id = assigned_to WHERE assigned_agent_id IS NULL AND assigned_to IS NOT NULL`);
            await pool.query(`UPDATE crm_contacts SET first_contact_at = first_contact_date WHERE first_contact_at IS NULL AND first_contact_date IS NOT NULL`);
            await pool.query(`UPDATE crm_contacts SET last_contact_at = last_contact_date WHERE last_contact_at IS NULL AND last_contact_date IS NOT NULL`);
            await pool.query(`UPDATE crm_contacts SET next_followup_at = next_followup_date WHERE next_followup_at IS NULL AND next_followup_date IS NOT NULL`);
            console.log('  → Old data migrated');
        } catch (e) { }

        // ══════════════════════════════════════
        // 3. ALTER crm_interactions
        // ══════════════════════════════════════
        console.log('\n📋 Updating crm_interactions...');
        const interactionCols = [
            ['tenant_id', 'INTEGER', null],
            ['channel', 'VARCHAR(30)', null],
            ['direction', 'VARCHAR(10)', null],
            ['body', 'TEXT', null],
            ['summary', 'TEXT', null],
            ['subject', 'VARCHAR(500)', null],
            ['next_action', 'VARCHAR(500)', null],
            ['quote_id', 'INTEGER', null],
            ['booking_id', 'INTEGER', null],
            ['thread_id', 'INTEGER', null],
            ['duration_seconds', 'INTEGER', null],
            ['performed_by_name', 'VARCHAR(200)', null],
            ['is_automated', 'BOOLEAN', 'false'],
            ['metadata', 'JSONB', "'{}'"],
        ];
        added = 0;
        for (const [col, type, def] of interactionCols) {
            if (await addColumn('crm_interactions', col, type, def)) added++;
        }
        console.log(`  → ${added} columns processed`);

        try {
            await pool.query(`UPDATE crm_interactions SET body = notes WHERE body IS NULL AND notes IS NOT NULL`);
        } catch (e) { }

        // ══════════════════════════════════════
        // 4. ALTER crm_tasks
        // ══════════════════════════════════════
        console.log('\n📋 Updating crm_tasks...');
        const taskCols = [
            ['tenant_id', 'INTEGER', null],
            ['quote_id', 'INTEGER', null],
            ['booking_id', 'INTEGER', null],
            ['created_by', 'INTEGER', null],
            ['title', 'VARCHAR(500)', null],
            ['reminder_at', 'TIMESTAMP', null],
            ['reminder_sent', 'BOOLEAN', 'false'],
            ['completion_notes', 'TEXT', null],
            ['outcome', 'VARCHAR(50)', null],
            ['is_recurring', 'BOOLEAN', 'false'],
            ['recurrence_pattern', 'VARCHAR(50)', null],
            ['parent_task_id', 'INTEGER', null],
            ['is_automated', 'BOOLEAN', 'false'],
            ['source_trigger', 'VARCHAR(100)', null],
        ];
        added = 0;
        for (const [col, type, def] of taskCols) {
            if (await addColumn('crm_tasks', col, type, def)) added++;
        }
        console.log(`  → ${added} columns processed`);

        try {
            await pool.query(`UPDATE crm_tasks SET title = description WHERE title IS NULL AND description IS NOT NULL`);
            await pool.query(`UPDATE crm_tasks SET title = task_type WHERE title IS NULL`);
        } catch (e) { }

        // ══════════════════════════════════════
        // 5. NEW TABLES
        // ══════════════════════════════════════
        console.log('\n📋 Creating new tables...');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_smart_notifications (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER,
        contact_id INTEGER,
        recipient_user_id INTEGER NOT NULL,
        recipient_type VARCHAR(30) DEFAULT 'agent',
        notification_type VARCHAR(50) NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        title VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        ai_summary TEXT,
        suggested_action VARCHAR(500),
        action_url VARCHAR(500),
        mobile_deeplink VARCHAR(500),
        channels VARCHAR(30)[] DEFAULT '{in_app}',
        escalation_level INTEGER DEFAULT 1,
        escalation_deadline TIMESTAMP,
        escalated_from INTEGER,
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMP,
        read_at TIMESTAMP,
        actioned_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log('✅ crm_smart_notifications');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_automation_rules (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER,
        rule_name VARCHAR(200) NOT NULL,
        description TEXT,
        trigger_event VARCHAR(100) NOT NULL,
        trigger_conditions JSONB DEFAULT '{}',
        actions JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        execution_count INTEGER DEFAULT 0,
        last_executed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log('✅ crm_automation_rules');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_automation_log (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER,
        tenant_id INTEGER,
        contact_id INTEGER,
        trigger_event VARCHAR(100),
        actions_executed JSONB,
        result VARCHAR(20) DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log('✅ crm_automation_log');

        // Insert default rules if empty
        const rulesCount = await pool.query('SELECT COUNT(*) as c FROM crm_automation_rules');
        if (parseInt(rulesCount.rows[0].c) === 0) {
            await pool.query(`
        INSERT INTO crm_automation_rules (tenant_id, rule_name, description, trigger_event, trigger_conditions, actions, is_active, priority) VALUES
          (NULL, 'Lead sin atender 24h', 'Escalar si el agente no atiende en 24 horas', 'no_response_check', '{"hours_threshold": 24}', '[{"type": "send_notification", "params": {"notification_type": "lead_abandoned", "priority": "high"}}]', true, 10),
          (NULL, 'Cotización creada → Follow-up', 'Tarea de seguimiento al cotizar', 'stage_changed', '{"new_stage": "quoted"}', '[{"type": "create_task", "params": {"task_type": "followup", "title": "Seguimiento de cotización", "due_hours": 48, "priority": "high"}}]', true, 5),
          (NULL, 'Booking confirmado → Reservado', 'Mover a Reservado al confirmar', 'booking_confirmed', '{}', '[{"type": "change_stage", "params": {"new_stage": "reserved"}}]', true, 5),
          (NULL, 'Post-viaje → Review', 'Solicitar evaluación', 'stage_changed', '{"new_stage": "post_trip"}', '[{"type": "create_task", "params": {"task_type": "review", "title": "Solicitar evaluación al cliente", "due_hours": 24}}]', true, 5)
      `);
            console.log('✅ Inserted 4 default automation rules');
        }

        // ══════════════════════════════════════
        // 6. INDEXES
        // ══════════════════════════════════════
        console.log('\n📋 Creating indexes...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_tenant ON crm_contacts(tenant_id)',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_agent ON crm_contacts(assigned_agent_id)',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_stage ON crm_contacts(pipeline_stage)',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_score ON crm_contacts(lead_score DESC)',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email)',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_hot ON crm_contacts(is_hot_lead) WHERE is_hot_lead = true',
            'CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status)',
            'CREATE INDEX IF NOT EXISTS idx_crm_interactions_contact ON crm_interactions(contact_id)',
            'CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(interaction_type)',
            'CREATE INDEX IF NOT EXISTS idx_crm_interactions_date ON crm_interactions(created_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks(assigned_to)',
            'CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact ON crm_tasks(contact_id)',
            'CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status)',
            'CREATE INDEX IF NOT EXISTS idx_crm_notif_recipient ON crm_smart_notifications(recipient_user_id)',
            'CREATE INDEX IF NOT EXISTS idx_crm_notif_status ON crm_smart_notifications(status)',
            'CREATE INDEX IF NOT EXISTS idx_crm_rules_trigger ON crm_automation_rules(trigger_event)',
        ];
        for (const idx of indexes) {
            await createIndex(idx);
        }
        console.log('✅ Indexes done');

        // ══════════════════════════════════════
        // FINAL REPORT
        // ══════════════════════════════════════
        const allTables = await pool.query(`SELECT tablename FROM pg_tables WHERE tablename LIKE 'crm_%' ORDER BY tablename`);
        console.log('\n═══════════════════════════════');
        console.log('🎉 MIGRATION 034 COMPLETE');
        console.log('═══════════════════════════════');
        console.log('Tables:', allTables.rows.map(r => r.tablename).join(', '));

        const stageCount = await pool.query('SELECT COUNT(*) as c FROM crm_pipeline_stages');
        console.log('Pipeline stages:', stageCount.rows[0].c);

        const ruleCount = await pool.query('SELECT COUNT(*) as c FROM crm_automation_rules');
        console.log('Automation rules:', ruleCount.rows[0].c);

        const colCount = await pool.query(`SELECT COUNT(*) as c FROM information_schema.columns WHERE table_name = 'crm_contacts'`);
        console.log('crm_contacts columns:', colCount.rows[0].c);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

run();
