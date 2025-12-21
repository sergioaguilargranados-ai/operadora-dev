import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando migración 010: Centro de Comunicación...')

    // Leer archivo SQL
    const sqlPath = path.join(process.cwd(), 'migrations', '010_communication_center.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Ejecutar migración
    await pool.query(sql)

    console.log('✅ Migración 010 completada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Migración 010 ejecutada correctamente - Centro de Comunicación',
      details: {
        tables: [
          'communication_threads',
          'messages',
          'message_deliveries',
          'message_reads',
          'communication_preferences',
          'message_templates',
          'scheduled_messages',
          'quick_responses',
          'communication_settings',
          'message_satisfaction'
        ],
        triggers: [
          'update_threads_updated_at',
          'update_messages_updated_at',
          'update_deliveries_updated_at',
          'update_prefs_updated_at',
          'trigger_update_thread_on_message'
        ],
        initial_data: {
          settings: 1,
          templates: 3,
          quick_responses: 4
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Error en migración 010:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 })
  }
}
