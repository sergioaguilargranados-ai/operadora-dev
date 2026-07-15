// API: Solicitud de registro como agencia
// POST /api/agency-onboarding - Formulario público de solicitud
// GET /api/agency-onboarding - Listar solicitudes (admin only)
// Build: 15 Jul 2026 - v2.423

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, queryMany } from '@/lib/db';

interface AgencyApplicationData {
    company_name: string;
    legal_name?: string;
    tax_id?: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    website?: string;
    city?: string;
    state?: string;
    country?: string;
    description?: string;
    expected_monthly_bookings?: string;
}

// POST — Enviar solicitud de agencia
export async function POST(request: NextRequest) {
    try {
        const body: AgencyApplicationData = await request.json();

        // Validaciones
        if (!body.company_name || !body.contact_name || !body.contact_email || !body.contact_phone) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos. Se requiere: nombre de empresa, nombre de contacto, email y teléfono.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.contact_email)) {
            return NextResponse.json(
                { success: false, error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Verificar si ya existe una solicitud con ese email
        const existing = await queryOne(
            `SELECT id, status FROM agency_applications WHERE contact_email = $1`,
            [body.contact_email]
        );

        if (existing) {
            return NextResponse.json(
                { success: false, error: `Ya existe una solicitud con este email (Estado: ${existing.status})` },
                { status: 409 }
            );
        }

        // IP del solicitante
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '0.0.0.0';

        // Insertar solicitud
        const application = await queryOne(
            `INSERT INTO agency_applications
       (company_name, legal_name, tax_id, contact_name, contact_email, contact_phone,
        website, city, state, country, description, expected_monthly_bookings,
        ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
       RETURNING id, status, created_at`,
            [
                body.company_name,
                body.legal_name || null,
                body.tax_id || null,
                body.contact_name,
                body.contact_email,
                body.contact_phone,
                body.website || null,
                body.city || null,
                body.state || null,
                body.country || 'México',
                body.description || null,
                body.expected_monthly_bookings || null,
                ipAddress,
            ]
        );

        // Notificar admin (sin bloquear respuesta)
        try {
            const NotificationService = (await import('@/services/NotificationService')).default;
            await NotificationService.sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@asoperadora.com',
                subject: `🏢 Nueva solicitud de agencia: ${body.company_name}`,
                html: `
          <h2>Nueva solicitud de registro de agencia</h2>
          <p><strong>Empresa:</strong> ${body.company_name}</p>
          <p><strong>Contacto:</strong> ${body.contact_name}</p>
          <p><strong>Email:</strong> ${body.contact_email}</p>
          <p><strong>Teléfono:</strong> ${body.contact_phone}</p>
          ${body.city ? `<p><strong>Ciudad:</strong> ${body.city}, ${body.state || ''}</p>` : ''}
          ${body.description ? `<p><strong>Descripción:</strong> ${body.description}</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/tenants?tab=applications">
            Ver solicitudes pendientes
          </a></p>
        `
            });
        } catch (emailErr) {
            console.error('⚠️ Error notificando admin:', emailErr);
        }

        console.log('🏢 Nueva solicitud de agencia:', {
            id: application?.id,
            company: body.company_name,
            email: body.contact_email
        });

        return NextResponse.json({
            success: true,
            data: {
                applicationId: application?.id,
                status: 'pending',
                message: '¡Solicitud enviada exitosamente! Nuestro equipo revisará tu aplicación y te contactará pronto.'
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error en solicitud de agencia:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al procesar solicitud'
        }, { status: 500 });
    }
}

// GET — Listar solicitudes (admin only)
export async function GET(request: NextRequest) {
    try {
        // TODO: Validar que es admin via JWT
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let whereClause = '';
        const params: unknown[] = [];

        if (status !== 'all') {
            whereClause = 'WHERE status = $1';
            params.push(status);
        }

        const applications = await queryMany(
            `SELECT * FROM agency_applications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${params.length + 1} OFFSET ${params.length + 2}`,
            [...params, limit, offset]
        );

        const countResult = await queryOne<{ total: string }>(
            `SELECT COUNT(*) as total FROM agency_applications ${whereClause}`,
            params
        );

        return NextResponse.json({
            success: true,
            data: applications,
            pagination: {
                page,
                limit,
                total: parseInt(countResult?.total || '0'),
                totalPages: Math.ceil(parseInt(countResult?.total || '0') / limit)
            }
        });

    } catch (error) {
        console.error('Error listando solicitudes:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al listar solicitudes'
        }, { status: 500 });
    }
}
