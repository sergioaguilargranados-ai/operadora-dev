import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Buscar al usuario y su tenant_id
    const userQuery = `
      SELECT u.id, u.tenant_id, u.accepted_terms_at, t.company_name, t.logo_url as tenant_logo_url,
             t.logo_mobile_url, t.primary_color, t.secondary_color
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE LOWER(TRIM(u.email)) = $1 AND (u.is_active = true OR u.is_active IS NULL)
      LIMIT 1
    `;
    const userRes = await query(userQuery, [cleanEmail]);

    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found or inactive' }, { status: 404 });
    }

    const userData = userRes.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        tenant_id: userData.tenant_id || 1,
        company_name: userData.company_name || 'AS Operadora',
        logo_url: userData.logo_mobile_url || userData.tenant_logo_url || '/logo.png',
        primary_color: userData.primary_color || '#1F2937',
        secondary_color: userData.secondary_color || '#3B82F6',
        has_accepted_terms: !!userData.accepted_terms_at,
      }
    });

  } catch (error) {
    console.error('Error in tenant-lookup:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
