-- 1. Agregar columnas a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;

-- 2. Tabla de referidos (para saber quién invitó a quién y su estado)
CREATE TABLE IF NOT EXISTS user_referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'registered', -- registered, purchased
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla para transacciones de puntos/wallet (auditoría)
CREATE TABLE IF NOT EXISTS reward_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50), -- referral_signup, referral_purchase, point_conversion
    points INTEGER DEFAULT 0,
    amount DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
