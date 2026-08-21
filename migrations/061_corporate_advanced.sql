-- Migration 061: Advanced Corporate Settings
CREATE TABLE IF NOT EXISTS corporate_policies (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    detailed_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, category)
);

CREATE TABLE IF NOT EXISTS travel_proposals (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    folio VARCHAR(20) NOT NULL,
    requested_by_id INTEGER REFERENCES tenant_users(id),
    destination VARCHAR(255) NOT NULL,
    travel_dates VARCHAR(100),
    estimated_budget DECIMAL(12, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
