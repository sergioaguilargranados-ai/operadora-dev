import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/emailHelper';

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

    // Enviar correo de bienvenida si hay un email
    if (email) {
      const emailHtml = `
<p>Hola, ${contact_name}.</p>
<p>Gracias por registrarte en AS Operadora de Viajes y Eventos.</p>
<p>Hemos recibido correctamente tu solicitud de registro y la informaci&oacute;n proporcionada ha sido enviada a nuestro equipo para su revisi&oacute;n.</p>
<p>Nuestro proceso de validaci&oacute;n puede tomar hasta 30 d&iacute;as naturales. Durante este periodo verificaremos la informaci&oacute;n recibida para brindarte la mejor atenci&oacute;n y habilitar los servicios que correspondan a tu perfil.</p>
<p>Una vez concluida la revisi&oacute;n, recibir&aacute;s una notificaci&oacute;n por correo electr&oacute;nico con la resoluci&oacute;n de tu solicitud y los pasos a seguir.</p>
<p>Agradecemos tu inter&eacute;s en formar parte de AS Operadora de Viajes y Eventos. Estamos comprometidos en ofrecer soluciones confiables para viajeros, agencias de viajes, agencias de eventos y empresas.</p>
<p>Atentamente,<br>
<strong>AS Operadora de Viajes y Eventos</strong></p>
      `;

      await sendEmail({
        to: email,
        subject: 'Confirmación de registro - AS Operadora',
        html: emailHtml
      }).catch(err => {
        console.error('Error al enviar el correo de registro:', err);
      });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error saving expo lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
