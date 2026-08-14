const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.query(`
SELECT 
  m.id, 
  m.body, 
  t.subject,
  m.message_type, 
  m.sender_type,
  m.created_at
FROM messages m
JOIN communication_threads t ON m.thread_id = t.id
LEFT JOIN tour_quotes tq ON t.reference_type = 'tour_quote' AND t.reference_id = tq.id
WHERE (t.client_id = 42 OR tq.contact_email = 'c@c.com')
  AND m.sender_type != 'client'
  AND m.is_internal = false
`)).then(r => console.log('Messages:', r.rows)).catch(e => console.log('error', e)).finally(() => c.end());
