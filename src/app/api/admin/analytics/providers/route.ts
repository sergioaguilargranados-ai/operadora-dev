import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/services/AuthService';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 401 });
    const decoded = await verifyToken(authHeader.split(' ')[1]);
    if (!decoded || !['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });

    // Ensure the table exists just in case
    await query(`
      CREATE TABLE IF NOT EXISTS provider_metrics (
        id SERIAL PRIMARY KEY,
        provider_name VARCHAR(100) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        response_time_ms INTEGER NOT NULL,
        results_count INTEGER NOT NULL,
        success BOOLEAN NOT NULL DEFAULT true,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Fetch aggregate metrics per provider
    const sql = `
      SELECT 
        provider_name, 
        service_type, 
        COUNT(*) as total_requests,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
        AVG(response_time_ms)::INTEGER as avg_response_time,
        AVG(results_count)::INTEGER as avg_results
      FROM provider_metrics
      GROUP BY provider_name, service_type
      ORDER BY total_requests DESC
    `;
    
    const result = await query(sql);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
