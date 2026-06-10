import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      contact_name, 
      contact_phone, 
      agency_name, 
      website, 
      social_media, 
      email, 
      job_title 
    } = body;
    
    if (!contact_name) {
      return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO expo_leads (
        contact_name, 
        contact_phone, 
        agency_name, 
        website, 
        social_media, 
        email, 
        job_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [contact_name, contact_phone, agency_name, website, social_media, email, job_title]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error saving expo lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
