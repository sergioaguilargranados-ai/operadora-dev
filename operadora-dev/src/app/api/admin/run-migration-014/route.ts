import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/admin/run-migration-014
 * Ejecutar migración para crear tabla payment_transactions
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Running migration 014: payment_transactions')

    // Crear tabla payment_transactions
    await query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,

        -- Relaciones
        booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL DEFAULT 1,
        tenant_id INTEGER NOT NULL DEFAULT 1,

        -- Información del pago
        amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'MXN',

        -- Estado
        status VARCHAR(50) NOT NULL DEFAULT 'pending',

        -- Método de pago
        payment_method VARCHAR(50) NOT NULL,

        -- IDs externos
        transaction_id VARCHAR(255) UNIQUE,
        external_reference VARCHAR(255),

        -- Detalles del pago (JSON)
        payment_details JSONB,

        -- Tarjeta (si aplica)
        card_last_four VARCHAR(4),
        card_brand VARCHAR(50),

        -- Errores
        error_code VARCHAR(100),
        error_message TEXT,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `)

    console.log('✅ Table payment_transactions created')

    // Crear índices
    await query(`CREATE INDEX IF NOT EXISTS idx_pt_booking_id ON payment_transactions(booking_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_pt_user_id ON payment_transactions(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_pt_status ON payment_transactions(status)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_pt_payment_method ON payment_transactions(payment_method)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_pt_created_at ON payment_transactions(created_at)`)

    console.log('✅ Indexes created')

    // Crear trigger para updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_pt_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await query(`
      DROP TRIGGER IF EXISTS trigger_pt_updated_at ON payment_transactions
    `)

    await query(`
      CREATE TRIGGER trigger_pt_updated_at
        BEFORE UPDATE ON payment_transactions
        FOR EACH ROW
        EXECUTE FUNCTION update_pt_updated_at()
    `)

    console.log('✅ Trigger created')

    // Verificar tabla creada
    const result = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payment_transactions'
      ORDER BY ordinal_position
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration 014 executed successfully',
      table: 'payment_transactions',
      columns: result.rows.map(r => r.column_name),
      total_columns: result.rows.length
    })

  } catch (error: any) {
    console.error('❌ Migration 014 failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}

// GET para verificar estado
export async function GET() {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'payment_transactions'
      ) as table_exists
    `)

    const tableExists = result.rows[0]?.table_exists

    if (tableExists) {
      const countResult = await query('SELECT COUNT(*) as total FROM payment_transactions')
      const columnsResult = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'payment_transactions'
        ORDER BY ordinal_position
      `)

      return NextResponse.json({
        status: 'ok',
        table_exists: true,
        total_records: countResult.rows[0]?.total || 0,
        columns: columnsResult.rows.map(r => r.column_name)
      })
    }

    return NextResponse.json({
      status: 'pending',
      table_exists: false,
      message: 'Table payment_transactions does not exist. Run POST to create.'
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
