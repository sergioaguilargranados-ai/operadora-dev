import { NextRequest, NextResponse } from 'next/server'
import AuthService from '@/services/AuthService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      user_type = 'cliente',
      company_name,
      company_id,
      agency_name,
      agency_id,
      corporate_role,
      agency_role,
      internal_role,
      referral_code
    } = body

    // Validar datos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Obtener IP del usuario
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0'

    // Registrar usuario
    console.log('🔵 REGISTRO INICIADO:', { email, name })

    const result = await AuthService.register({
      name,
      email,
      password,
      phone,
      user_type,
      company_name,
      company_id,
      agency_name,
      agency_id,
      corporate_role,
      agency_role,
      internal_role,
      referral_code
    }, ipAddress)

    console.log('✅ REGISTRO EXITOSO:', {
      userId: result.user?.id,
      email: result.user?.email
    })

    // Enviar correo de verificación
    if (result.success && result.user) {
      try {
        const crypto = await import('crypto');
        const { query } = await import('@/lib/db');
        const { sendEmailVerificationEmail } = await import('@/lib/emailHelper');

        // Generar token de verificación
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Guardar token en BD
        await query(
          `INSERT INTO email_verification_tokens 
           (user_id, token, expires_at, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            result.user.id,
            token,
            expiresAt,
            ipAddress,
            request.headers.get('user-agent') || 'unknown'
          ]
        );

        // Generar URL de verificación
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

        // Enviar email de verificación
        await sendEmailVerificationEmail({
          name: result.user.name,
          email: result.user.email,
          verificationUrl,
          expiryTime: '24 horas'
        });

        console.log('📧 Email de verificación enviado a:', result.user.email);
      } catch (emailError) {
        console.error('⚠️ Error enviando email de verificación:', emailError);
        // No fallar el registro si el correo falla
      }

      // ─── Auto-creación de contacto CRM ───
      try {
        const { CRMService } = await import('@/services/CRMService');
        const crm = new CRMService();

        // Verificar si ya existe un contacto con este email
        const existing = await crm.listContacts({ search: result.user.email, limit: 1 });
        if (existing.contacts.length === 0) {
          await crm.createContact({
            user_id: result.user.id,
            contact_type: 'lead',
            full_name: name,
            email: result.user.email,
            phone: phone || undefined,
            source: 'web_register',
            source_detail: `Registro web (tipo: ${user_type})`,
            pipeline_stage: 'new',
          });
          console.log('🟢 Contacto CRM creado para nuevo usuario:', result.user.email);
        } else {
          // Vincular user_id al contacto existente si no lo tiene
          const contact = existing.contacts[0];
          if (!contact.user_id) {
            await crm.updateContact(contact.id, { user_id: result.user.id });
            console.log('🔗 Usuario vinculado a contacto CRM existente:', result.user.email);
          }
        }
      } catch (crmError) {
        console.error('⚠️ Error creando contacto CRM (no bloquea registro):', crmError);
        // No fallar el registro si el CRM falla
      }

      // ─── Auto-vinculación de referido ───
      try {
        const referralCode = request.cookies.get('as_referral')?.value
          || body.referral_code
          || request.headers.get('x-referral-code')

        if (referralCode) {
          const { queryOne, query: dbQuery } = await import('@/lib/db');

          // Buscar al agente que tiene este referral_code
          const agent = await queryOne<{ user_id: number; tenant_id: number }>(
            `SELECT tu.user_id, tu.tenant_id
             FROM tenant_users tu
             WHERE tu.referral_code = $1 AND tu.is_active = true
             LIMIT 1`,
            [referralCode]
          );

          if (agent) {
            // Registrar la conversión en referral_conversions
            await dbQuery(
              `INSERT INTO referral_conversions
               (referral_code, agent_user_id, converted_user_id, tenant_id, conversion_type, ip_address)
               VALUES ($1, $2, $3, $4, 'registration', $5)
               ON CONFLICT DO NOTHING`,
              [referralCode, agent.user_id, result.user.id, agent.tenant_id, ipAddress]
            );

            // Vincular al nuevo usuario con el tenant del agente como cliente
            await dbQuery(
              `INSERT INTO tenant_users (user_id, tenant_id, role, is_active)
               VALUES ($1, $2, 'client', true)
               ON CONFLICT (user_id, tenant_id) DO NOTHING`,
              [result.user.id, agent.tenant_id]
            );

            // Registrar en agency_clients si existe la tabla
            try {
              await dbQuery(
                `INSERT INTO agency_clients (tenant_id, user_id, referred_by_agent_id, referral_code, status)
                 VALUES ($1, $2, $3, $4, 'active')
                 ON CONFLICT DO NOTHING`,
                [agent.tenant_id, result.user.id, agent.user_id, referralCode]
              );
            } catch { /* tabla puede no existir aún */ }

            console.log('🔗 Referido vinculado:', {
              newUserId: result.user.id,
              agentUserId: agent.user_id,
              tenantId: agent.tenant_id,
              referralCode
            });
          }
        }
      } catch (referralError) {
        console.error('⚠️ Error vinculando referido:', referralError);
        // No fallar el registro si la vinculación falla
      }
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar usuario'
    }, { status: 500 })
  }
}
