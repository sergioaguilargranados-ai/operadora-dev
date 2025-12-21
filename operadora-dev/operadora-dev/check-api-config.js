#!/usr/bin/env node

/**
 * Script para verificar la configuración de APIs
 * Uso: node check-api-config.js
 */

console.log('🔍 Verificando configuración de APIs...\n')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const checks = {
  amadeus: {
    required: ['AMADEUS_API_KEY', 'AMADEUS_API_SECRET'],
    optional: ['AMADEUS_SANDBOX'],
    name: 'Amadeus (Vuelos)'
  },
  kiwi: {
    required: ['KIWI_API_KEY'],
    optional: [],
    name: 'Kiwi.com (Vuelos Low-Cost)'
  },
  expedia: {
    required: ['EXPEDIA_API_KEY', 'EXPEDIA_API_SECRET'],
    optional: ['EXPEDIA_SANDBOX'],
    name: 'Expedia (Vuelos + Hoteles)'
  },
  booking: {
    required: ['BOOKING_API_KEY'],
    optional: [],
    name: 'Booking.com (Hoteles)'
  },
  database: {
    required: ['DATABASE_URL'],
    optional: [],
    name: 'PostgreSQL (Neon)'
  },
  openai: {
    required: ['OPENAI_API_KEY'],
    optional: [],
    name: 'OpenAI (Chatbot + IA)'
  },
  sendgrid: {
    required: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
    optional: [],
    name: 'SendGrid (Emails)'
  },
  facturama: {
    required: ['FACTURAMA_USER', 'FACTURAMA_PASSWORD'],
    optional: ['FACTURAMA_SANDBOX'],
    name: 'Facturama (Facturación MX)'
  }
}

let totalConfigured = 0
let totalRequired = 0

console.log('═'.repeat(60))
console.log('📋 ESTADO DE CONFIGURACIÓN DE APIs')
console.log('═'.repeat(60))

Object.entries(checks).forEach(([key, config]) => {
  const allVars = [...config.required, ...config.optional]
  const configuredVars = allVars.filter(varName => process.env[varName])
  const requiredConfigured = config.required.filter(varName => process.env[varName])

  const isConfigured = requiredConfigured.length === config.required.length
  const status = isConfigured ? '✅' : '❌'

  console.log(`\n${status} ${config.name}`)

  config.required.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      const masked = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
        ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
        : value.substring(0, 20) + '...'
      console.log(`   ✓ ${varName}: ${masked}`)
    } else {
      console.log(`   ✗ ${varName}: NO CONFIGURADO`)
    }
  })

  config.optional.forEach(varName => {
    const value = process.env[varName]
    if (value) {
      console.log(`   ✓ ${varName}: ${value}`)
    } else {
      console.log(`   ○ ${varName}: (opcional, no configurado)`)
    }
  })

  if (isConfigured) totalConfigured++
  totalRequired++
})

console.log('\n' + '═'.repeat(60))
console.log(`\n📊 Resumen: ${totalConfigured}/${totalRequired} APIs configuradas`)

if (totalConfigured === 0) {
  console.log('\n⚠️  NINGUNA API CONFIGURADA')
  console.log('\n📝 Para empezar:')
  console.log('   1. Crea un archivo .env.local en la raíz del proyecto')
  console.log('   2. Copia .env.example a .env.local')
  console.log('   3. Llena las credenciales de las APIs que quieras usar')
  console.log('   4. Ejecuta este script de nuevo para verificar')
  console.log('\n📚 Guía completa: .same/INTEGRACION-APIS-REALES.md')
} else if (totalConfigured < totalRequired) {
  console.log('\n⚠️  FALTAN ALGUNAS APIs POR CONFIGURAR')
  console.log('\n💡 Prioridades sugeridas:')
  console.log('   1. DATABASE_URL (requerido para funcionamiento básico)')
  console.log('   2. AMADEUS_API_KEY (vuelos - gratis y fácil de obtener)')
  console.log('   3. SENDGRID_API_KEY (emails - gratis hasta 100/día)')
  console.log('   4. OPENAI_API_KEY (chatbot - $5 de crédito inicial)')
  console.log('\n📚 Guía paso a paso: .same/INTEGRACION-APIS-REALES.md')
} else {
  console.log('\n✅ TODAS LAS APIs ESTÁN CONFIGURADAS')
  console.log('\n🚀 Puedes deployar a producción!')
}

console.log('\n' + '═'.repeat(60))

// Verificar archivo .env.local existe
const fs = require('fs')
const path = require('path')
const envPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  ADVERTENCIA: No se encontró archivo .env.local')
  console.log('   Crea uno copiando .env.example:')
  console.log('   $ cp .env.example .env.local')
}

console.log('')
