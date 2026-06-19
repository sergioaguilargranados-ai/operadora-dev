import { NextRequest, NextResponse } from 'next/server';
import { query, db } from '@/lib/db';
import { verifyToken } from '@/services/AuthService';

async function ensureTableExists() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS airlines_catalog (
      iata_code VARCHAR(10) PRIMARY KEY,
      name VARCHAR(255),
      logo_url TEXT,
      is_custom BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    const decoded = await verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });

    await ensureTableExists();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    
    let baseQuery = 'SELECT * FROM airlines_catalog';
    const params: any[] = [];

    if (search) {
      baseQuery += ' WHERE LOWER(name) LIKE LOWER($1) OR UPPER(iata_code) LIKE UPPER($1)';
      params.push(`%${search}%`);
    }
    
    baseQuery += ' ORDER BY name ASC';

    const result = await db.query(baseQuery, params);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    const decoded = await verifyToken(authHeader.split(' ')[1]);
    if (!decoded || !['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });

    await ensureTableExists();
    const data = await request.json();
    
    if (!data.iata_code || !data.logo_url) {
      return NextResponse.json({ success: false, error: 'Código IATA y URL del logo son requeridos' }, { status: 400 });
    }

    const text = `
      INSERT INTO airlines_catalog (iata_code, name, logo_url, is_custom, updated_at)
      VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
      ON CONFLICT (iata_code) DO UPDATE 
      SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url, is_custom = true, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await db.query(text, [data.iata_code.toUpperCase(), data.name || data.iata_code, data.logo_url]);
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating airline:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
