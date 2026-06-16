import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');
    const secret = searchParams.get('secret');

    if (secret !== (process.env.CRON_SECRET || 'admin-test-2026')) {
        return NextResponse.json({ error: 'Unauthorized. Agrega ?secret=admin-test-2026' }, { status: 401 });
    }

    let smtpResult: any = { status: 'SKIPPED' };
    let resendResult: any = { status: 'SKIPPED' };

    // --- 1. Probar SMTP (SiteGround) ---
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = parseInt((process.env.SMTP_PORT || '587').trim(), 10);
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').replace(/^"|"$/g, '').trim();

    if (smtpHost && smtpUser) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                },
                tls: { rejectUnauthorized: false }
            } as any);

            // Solo verificar la conexión si no hay correo de destino
            if (!to) {
                await transporter.verify();
                smtpResult = { status: 'OK', message: 'Conexión SMTP exitosa al servidor ' + smtpHost + ' en puerto ' + smtpPort };
            } else {
                const info = await transporter.sendMail({
                    from: `"AS Operadora Test SMTP" <${smtpUser}>`,
                    to: to,
                    subject: 'Prueba de Conexión SMTP',
                    text: 'Si recibes este correo, la configuración SMTP es correcta.'
                });
                smtpResult = { status: 'OK', messageId: info.messageId, host: smtpHost, port: smtpPort };
            }
        } catch (err: any) {
            smtpResult = { status: 'FAILED', error: err.message, code: err.code, command: err.command };
        }
    } else {
        smtpResult = { status: 'NOT_CONFIGURED', error: 'Faltan variables SMTP_HOST o SMTP_USER' };
    }

    // --- 2. Probar Resend ---
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    const fromEmail = (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').trim();

    if (apiKey) {
        try {
            const resend = new Resend(apiKey);
            if (!to) {
                const domains = await resend.domains.list();
                resendResult = { status: 'OK', domains: (domains.data as any)?.data?.map((d: any) => ({ name: d.name, status: d.status })) };
            } else {
                const { data, error } = await resend.emails.send({
                    from: `AS Operadora <${fromEmail}>`,
                    to: [to],
                    subject: `✅ Test Resend`,
                    html: `<p>Prueba de Resend.</p>`
                });
                if (error) resendResult = { status: 'FAILED', error };
                else resendResult = { status: 'OK', id: data?.id };
            }
        } catch (err: any) {
            resendResult = { status: 'FAILED', error: err.message };
        }
    } else {
        resendResult = { status: 'NOT_CONFIGURED' };
    }

    return NextResponse.json({
        instructions: 'Para enviar correo de prueba agrega &to=tucorreo@gmail.com',
        smtpConfig: {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            hasPass: !!smtpPass
        },
        smtpTest: smtpResult,
        resendTest: resendResult
    });
}
