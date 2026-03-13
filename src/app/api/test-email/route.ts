import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * GET /api/test-email?to=tucorreo@gmail.com
 * Endpoint de diagnóstico SMTP — solo ADMIN o con secret
 * Devuelve el error exacto del servidor para diagnóstico.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')
    const secret = searchParams.get('secret')

    // Protección básica
    if (secret !== (process.env.CRON_SECRET_KEY || 'admin-test-2026')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '465')
    const user = process.env.SMTP_USER
    const passRaw = process.env.SMTP_PASS || ''
    const pass = passRaw.replace(/^"|"$/g, '')

    const config = {
        host,
        port,
        secure: port === 465,
        smtpUser: user,
        passLength: pass.length,
        passFirstChars: pass.substring(0, 3) + '***',
        nodeEnv: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
    }

    // 1. Verificar conexión
    let verifyResult: any = null
    let verifyError: any = null
    try {
        const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
        await transporter.verify()
        verifyResult = 'OK — conexión SMTP exitosa'
    } catch (err: any) {
        verifyError = {
            message: err.message,
            code: err.code,
            responseCode: err.responseCode,
            response: err.response,
            command: err.command
        }
    }

    // 2. Si verify OK y hay destinatario, enviar test
    let sendResult: any = null
    let sendError: any = null
    if (!verifyError && to) {
        try {
            const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
            const info = await transporter.sendMail({
                from: `"AS Operadora TEST" <${user}>`,
                to,
                subject: `🧪 Test SMTP ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`,
                html: `
                    <div style="font-family:Arial;max-width:500px;margin:0 auto;padding:24px;">
                        <div style="background:#0066FF;color:white;padding:16px;border-radius:8px 8px 0 0;">
                            <strong>AS</strong> Operadora — Email de prueba
                        </div>
                        <div style="padding:20px;background:#f9f9f9;border:1px solid #eee;">
                            <p>✅ <strong>Conexión SMTP funcionando correctamente</strong></p>
                            <p>Servidor: ${host}:${port}</p>
                            <p>Hora: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })} CST</p>
                        </div>
                    </div>`
            })
            sendResult = { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected }
        } catch (err: any) {
            sendError = { message: err.message, code: err.code, responseCode: err.responseCode, response: err.response }
        }
    }

    return NextResponse.json({
        config,
        verify: verifyError ? { status: 'FAILED', error: verifyError } : { status: 'OK', message: verifyResult },
        send: to
            ? (sendError ? { status: 'FAILED', error: sendError } : { status: 'OK', result: sendResult })
            : { status: 'SKIPPED', message: 'Agrega ?to=tucorreo@gmail.com para probar envío' }
    })
}
