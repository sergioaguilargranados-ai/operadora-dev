import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Buscar al usuario y su tenant_id
    const userQuery = `
      SELECT u.id, u.tenant_id, t.company_name, t.logo_url as tenant_logo_url,
             t.logo_mobile_url, t.primary_color, t.secondary_color
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1 AND u.is_active = true
      LIMIT 1
    `;
    const userRes = await pool.query(userQuery, [email.toLowerCase()]);

    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found or inactive' }, { status: 404 });
    }

    const userData = userRes.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        tenant_id: userData.tenant_id,
        company_name: userData.company_name,
        logo_url: userData.logo_mobile_url || userData.tenant_logo_url || '/logo.png',
        primary_color: userData.primary_color || '#1F2937', // default gray-800
        secondary_color: userData.secondary_color || '#3B82F6', // default blue-500
      }
    });

  } catch (error) {
    console.error('Error in tenant-lookup:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
