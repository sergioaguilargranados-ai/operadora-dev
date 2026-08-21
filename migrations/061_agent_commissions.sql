CREATE TABLE IF NOT EXISTS agent_commissions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    sale_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
