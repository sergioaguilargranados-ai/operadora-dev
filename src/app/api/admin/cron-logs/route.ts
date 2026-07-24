import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Only fetch the last 100 logs
    const result = await query(`
      SELECT * 
      FROM cron_logs 
      ORDER BY started_at DESC 
      LIMIT 100
    `);

    return NextResponse.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Error fetching cron logs:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
