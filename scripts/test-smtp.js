/**
 * Script de diagnóstico SMTP - AS Operadora
 * Ejecutar: node scripts/test-smtp.js [email@destino]
 */

// Usar dotenv directo, no dotenvx, para evitar sustitución de variables
const fs = require('fs')
const path = require('path')

// Leer .env.local manualmente para evitar interferencia de dotenvx
const envFile = path.join(process.cwd(), '.env.local')
const envLines = fs.readFileSync(envFile, 'utf8').split('\n')
const envVars = {}
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq < 0) continue
  const key = trimmed.slice(0, eq).trim()
  let val = trimmed.slice(eq + 1).trim()
  // Quitar comillas dobles si las hubiera
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
  envVars[key] = val
}

const nodemailer = require('nodemailer')

const host   = envVars.SMTP_HOST
const port   = parseInt(envVars.SMTP_PORT || '465')
const user   = envVars.SMTP_USER
const passRaw = envVars.SMTP_PASS || ''
const pass   = passRaw.replace(/^"|"$/g, '') // quitar comillas si dotenv las preserva
const testTo = process.argv[2] || user // destino opcional como argumento

console.log('\n🔍 Diagnóstico SMTP - AS Operadora')
console.log('=' .repeat(40))
console.log(`Host    : ${host}`)
console.log(`Port    : ${port}`)
console.log(`User    : ${user}`)
console.log(`Pass    : ${pass ? '✅ configurado (' + pass.length + ' chars)' : '❌ VACÍO'}`)
console.log(`Secure  : ${port === 465}`)
console.log(`Test to : ${testTo}`)
console.log('=' .repeat(40))

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  debug: true,
  logger: true
})

async function run() {
  // 1. Verificar conexión
  console.log('\n📡 Verificando conexión SMTP...')
  try {
    await transporter.verify()
    console.log('✅ Conexión SMTP: OK')
  } catch (err) {
    console.error('❌ Error de conexión:', err.message)
    console.log('\n💡 Sugerencias:')
    console.log('  - Verificar SMTP_HOST en .env.local')
    console.log('  - Verificar que el puerto', port, 'esté abierto')
    console.log('  - Revisar firewall o restricciones del hosting')
    return
  }

  // 2. Enviar email de prueba
  console.log(`\n📧 Enviando email de prueba a: ${testTo}`)
  try {
    const info = await transporter.sendMail({
      from: `"AS Operadora TEST" <${user}>`,
      to: testTo,
      subject: `🧪 Test SMTP - AS Operadora - ${new Date().toLocaleString('es-MX')}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:8px;">
          <div style="background:#0066FF;color:white;padding:16px 24px;border-radius:6px 6px 0 0;margin:-24px -24px 24px;">
            <strong style="font-family:Georgia,serif;font-size:20px;">AS</strong>
            <span style="margin-left:8px;font-size:12px;">Operadora — Diagnóstico SMTP</span>
          </div>
          <h2 style="color:#333;margin:0 0 8px;">✅ Email de prueba recibido</h2>
          <p style="color:#666;">Si estás leyendo esto, el servidor SMTP está configurado correctamente.</p>
          <table style="width:100%;font-size:13px;margin-top:16px;">
            <tr><td style="color:#888;padding:4px 0;">Enviado desde:</td><td style="font-weight:bold;">${user}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Servidor:</td><td>${host}:${port}</td></tr>
            <tr><td style="color:#888;padding:4px 0;">Fecha/hora:</td><td>${new Date().toLocaleString('es-MX', {timeZone:'America/Mexico_City'})}</td></tr>
          </table>
        </div>
      `,
      text: 'AS Operadora - Email de prueba SMTP exitoso'
    })
    console.log('✅ Email enviado exitosamente!')
    console.log('   MessageId:', info.messageId)
    console.log('   Accepted :', info.accepted)
    console.log('   Rejected :', info.rejected)
    console.log('\n✅ DIAGNÓSTICO COMPLETO: Todo funciona correctamente')
  } catch (err) {
    console.error('❌ Error al enviar:', err.message)
    console.error('   Código:', err.code)
    console.error('   Respuesta SMTP:', err.response)
  }
}

run()
