import { NextRequest, NextResponse } from 'next/server';
import { queryPaginated, query } from '@/lib/db';
import { verifyToken } from '@/services/AuthService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Token inválido o expirado' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const searchTerm = searchParams.get('search') || '';

    let baseQuery = 'SELECT * FROM hotels';
    const params: any[] = [];

    if (searchTerm) {
      baseQuery += ' WHERE LOWER(name) LIKE LOWER($1) OR LOWER(city) LIKE LOWER($1)';
      params.push(`%${searchTerm}%`);
    }

    const result = await queryPaginated(baseQuery, params, {
      page,
      limit,
      orderBy: 'id',
      orderDirection: 'DESC'
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error fetching admin hotels:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
