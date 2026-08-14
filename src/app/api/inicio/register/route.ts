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
      providerProduct,
      password,
      referralCode
    } = body;
    
    const final_name = contact_name || fullName;
    const final_phone = contact_phone || phone;
    const final_agency = agency_name || company;
    const final_job = job_title || type;
    
    if (!final_name) {
      return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 });
    }

    if (email) {
      // Validar contra usuarios existentes
      const existingUser = await query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'Este correo electrónico ya está registrado.' }, { status: 400 });
      }

      // Validar contra el CRM principal
      const existing = await query(`SELECT id FROM crm_contacts WHERE email = $1 LIMIT 1`, [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'Este correo electrónico ya está registrado.' }, { status: 400 });
      }
    }

    // Si viene contraseña, crear la cuenta de usuario
    if (password && email) {
      try {
        const bcrypt = (await import('bcryptjs')).default;
        const passwordHash = await bcrypt.hash(password, 10);
        const roleMap: Record<string, string> = {
          'Viajero': 'cliente',
          'Agencia de Viajes': 'agencia',
          'Agencia de Eventos': 'agencia',
          'Empresa': 'corporativo',
          'Proveedor': 'proveedor'
        };
        const userRole = roleMap[final_job] || 'cliente';
        const userStatus = final_job === 'Viajero' ? 'active' : 'pending';

        await query(
          `INSERT INTO users (name, email, password_hash, phone, role, status, referral_code, company_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (email) DO NOTHING`,
          [final_name, email, passwordHash, final_phone || null, userRole, userStatus, referralCode || null, final_agency || null]
        );
      } catch (userErr) {
        console.error('Error al crear usuario en registro-leads:', userErr);
      }
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

    // Agregar al CRM de contactos también
    try {
      const { crmService } = await import('@/services/CRMService');
      const contactTypeMap: Record<string, string> = {
        'Viajero': 'lead',
        'Agencia de Viajes': 'agency',
        'Agencia de Eventos': 'agency',
        'Empresa': 'corporate',
        'Proveedor': 'provider'
      };
      await crmService.createContact({
        full_name: final_name,
        email: email,
        phone: final_phone,
        company: final_agency,
        position: final_job,
        source: 'campaign', // o 'web'
        source_detail: 'Registro Landing PWA',
        contact_type: contactTypeMap[final_job] || 'lead',
        pipeline_stage: 'new',
        notes: providerProduct ? `Provee: ${providerProduct}` : '',
      });
    } catch (crmError) {
      console.error('Error al sincronizar con CRM:', crmError);
    }

    return NextResponse.json({ success: true, data: result.rows[0], emailSent: emailResult });
  } catch (error: any) {
    console.error('Error saving expo lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
