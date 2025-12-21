import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check which tables exist
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'featured_offers', 'featured_hero', 'flight_destinations',
        'accommodation_favorites', 'weekend_deals', 'vacation_packages',
        'unique_stays', 'explore_destinations', 'promotions', 'featured_destinations',
        'featured_packages'
      )
      ORDER BY table_name
    `);

    const tableStructures: any = {};

    // Get columns for each table
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);

      tableStructures[table.table_name] = columns.rows;
    }

    return NextResponse.json({
      success: true,
      tables: tables.rows.map((t: any) => t.table_name),
      structures: tableStructures
    });

  } catch (error: any) {
    console.error('[CHECK TABLES] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
