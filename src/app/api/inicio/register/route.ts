import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendLandingWelcomeEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      contact_name, fullName,
      contact_phone, phone,
      agency_name, company,
      website, 
      social_media, 
      email, 
      job_title, type,
      providerProduct
    } = body;
    
    const final_name = contact_name || fullName;
    const final_phone = contact_phone || phone;
    const final_agency = agency_name || company;
    const final_job = job_title || type;
    
    if (!final_name) {
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
      [final_name, final_phone, final_agency, website, social_media, email, final_job]
    );

    // Enviar correo de bienvenida con formato corporativo si hay un email
    let emailResult: any = null;
    if (email) {
      emailResult = await sendLandingWelcomeEmail({
        name: final_name,
        email: email,
        type: final_job,
        phone: final_phone,
        company: final_agency,
        providerProduct: providerProduct
      }).catch(err => {
        console.error('Error al enviar el correo corporativo de registro:', err);
        return { error: err.message };
      });
    }

    return NextResponse.json({ success: true, data: result.rows[0], emailSent: emailResult });
  } catch (error: any) {
    console.error('Error saving expo lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
