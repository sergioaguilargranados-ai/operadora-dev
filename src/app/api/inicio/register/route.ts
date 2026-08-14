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

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    if (cleanEmail) {
      // Validar si ya existe una cuenta de usuario completa con este email
      const existingUser = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanEmail]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ success: false, error: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' }, { status: 400 });
      }
    }

    // Crear o asegurar la cuenta de usuario en la tabla `users`
    let createdUser: any = null;
    if (cleanEmail) {
      try {
        const bcrypt = (await import('bcryptjs')).default;
        const passwordHash = password 
          ? await bcrypt.hash(password, 10) 
          : await bcrypt.hash('Temporal123!', 10);
        
        const roleMap: Record<string, string> = {
          'Viajero': 'CLIENT',
          'Agencia de Viajes': 'AGENCY',
          'Agencia de Eventos': 'AGENCY',
          'Empresa': 'CORPORATE',
          'Proveedor': 'PROVIDER'
        };
        const userRole = roleMap[final_job] || 'CLIENT';

        const userInsert = await query(
          `INSERT INTO users (name, email, password_hash, phone, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET 
             name = EXCLUDED.name,
             password_hash = CASE WHEN $3 != '' THEN EXCLUDED.password_hash ELSE users.password_hash END,
             phone = EXCLUDED.phone,
             updated_at = NOW()
           RETURNING id, name, email, role, is_active`,
          [final_name, cleanEmail, passwordHash, final_phone || '', userRole, false]
        );
        createdUser = userInsert.rows[0];
        console.log('✅ Usuario registrado exitosamente (Pendiente de aprobación - Inactivo):', userInsert.rows[0]);
      } catch (userErr: any) {
        console.error('❌ Error al crear usuario en tabla users:', userErr.message);
        throw new Error(`Error al crear usuario en el sistema: ${userErr.message}`);
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
      [final_name, final_phone, final_agency, website, social_media, cleanEmail, final_job]
    );

    // Enviar correo de bienvenida con formato corporativo si hay un email
    let emailResult: any = null;
    if (cleanEmail) {
      emailResult = await sendLandingWelcomeEmail({
        name: final_name,
        email: cleanEmail,
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
        user_id: createdUser?.id || undefined,
        full_name: final_name,
        email: cleanEmail,
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

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0], 
      user: createdUser,
      emailSent: emailResult 
    });
  } catch (error: any) {
    console.error('Error saving expo lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
