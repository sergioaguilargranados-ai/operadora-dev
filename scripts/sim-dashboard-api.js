require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const tenantId = '1';
    let queryText = `
      SELECT
        pt.id,
        pt.booking_id,
        pt.user_id,
        pt.tenant_id,
        pt.amount,
        pt.currency,
        pt.status,
        pt.payment_method,
        pt.transaction_id,
        pt.capture_id,
        pt.payer_email,
        pt.payer_id,
        pt.error_message,
        pt.created_at,
        pt.paid_at,
        pt.refunded_at,
        COALESCE(u.name, 'Usuario') as user_name,
        COALESCE(u.email, '') as user_email,
        COALESCE(b.booking_type, 'general') as booking_type,
        COALESCE(b.service_type, 'servicio') as service_name
      FROM payment_transactions pt
      LEFT JOIN users u ON pt.user_id = u.id
      LEFT JOIN bookings b ON pt.booking_id = b.id
      WHERE 1=1
    `
    const queryParams = [];
    let paramCount = 0;

    if (tenantId) {
      paramCount++
      queryText += ` AND pt.tenant_id = $${paramCount}`
      queryParams.push(parseInt(tenantId))
    }

    const countQueryText = queryText.replace(
      /SELECT .* FROM/,
      'SELECT COUNT(*) FROM'
    )
    console.log("Count Query:", countQueryText);

    const countResult = await pool.query(countQueryText, queryParams);
    const total = parseInt(countResult.rows?.[0]?.count || '0');
    console.log("Total:", total);

    queryText += ` ORDER BY pt.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(50, 0)
    
    console.log("Main Query:", queryText);
    const result = await pool.query(queryText, queryParams);
    console.log("Rows count:", result.rows.length);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
