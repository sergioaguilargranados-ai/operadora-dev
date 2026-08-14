import bcrypt from 'bcryptjs';
import { pool } from '../src/lib/db';

async function syncLeadsToUsers() {
  const client = await pool.connect();
  try {
    console.log('🔄 Sincronizando leads a la tabla users...');
    
    // Buscar contactos en crm_contacts o expo_leads que no estén en users
    const crmLeads = await client.query(`
      SELECT DISTINCT ON (LOWER(c.email)) 
        c.full_name, c.email, c.phone, c.contact_type, c.company
      FROM crm_contacts c
      WHERE c.email IS NOT NULL AND c.email != ''
        AND NOT EXISTS (
          SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(c.email)
        )
    `);

    console.log(`📋 Encontrados ${crmLeads.rows.length} contactos sin usuario:`);
    const defaultPassword = await bcrypt.hash('ASOperadora2026!', 10);

    for (const lead of crmLeads.rows) {
      const roleMap: Record<string, string> = {
        'lead': 'CLIENT',
        'agency': 'AGENCY',
        'corporate': 'CORPORATE',
        'provider': 'PROVIDER'
      };
      const userRole = roleMap[lead.contact_type] || 'CLIENT';
      
      const insertRes = await client.query(`
        INSERT INTO users (name, email, password_hash, phone, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id, name, email, role
      `, [lead.full_name || 'Usuario', lead.email.toLowerCase().trim(), defaultPassword, lead.phone || '', userRole, true]);

      if (insertRes.rows.length > 0) {
        console.log(`✅ Creado usuario para ${lead.email} con rol ${userRole}`);
      }
    }

    console.log('🎉 Sincronización completada.');
  } catch (err) {
    console.error('Error en sync:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

syncLeadsToUsers();
