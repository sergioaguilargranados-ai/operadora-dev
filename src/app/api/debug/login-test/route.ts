import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const firstUser = await pool.query('SELECT email FROM users LIMIT 1');

    return NextResponse.json({
      success: true,
      userCount: userCount.rows[0].count,
      sampleUser: firstUser.rows[0]
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
