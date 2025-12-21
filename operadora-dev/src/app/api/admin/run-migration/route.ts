import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '007_homepage_content.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(sql);

    return NextResponse.json({
      success: true,
      message: 'Migration 007 executed successfully'
    });

  } catch (error: any) {
    console.error('[MIGRATION] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
