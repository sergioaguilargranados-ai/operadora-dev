import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando migración 009: Sistema de Facturación...')

    // Leer archivo SQL
    const sqlPath = path.join(process.cwd(), 'database', 'migrations', '009_invoices_system.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Ejecutar migración
    await pool.query(sql)

    console.log('✅ Migración 009 completada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Migración 009 ejecutada correctamente',
      details: {
        tables: ['invoices', 'accounts_receivable', 'accounts_payable'],
        views: ['v_invoices_summary', 'v_ar_pending', 'v_ap_pending'],
        functions: ['generate_invoice_number', 'set_invoice_number']
      }
    })

  } catch (error: any) {
    console.error('❌ Error en migración 009:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 })
  }
}
