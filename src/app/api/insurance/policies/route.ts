import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let sql = `
      SELECT 
        id,
        policy_number,
        tenant_id,
        user_id,
        booking_id,
        plan_code,
        plan_name,
        destination_region,
        start_date,
        end_date,
        total_days,
        passengers_count,
        total_price,
        currency,
        insured_travelers,
        emergency_contact,
        coverage_details,
        status,
        payment_status,
        voucher_url,
        created_at,
        updated_at
      FROM travel_insurance_policies
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (userId && userId !== 'all') {
      sql += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (bookingId) {
      sql += ` AND booking_id = $${paramIndex}`
      params.push(bookingId)
      paramIndex++
    }

    if (status && status !== 'all') {
      sql += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (search) {
      sql += ` AND (
        policy_number ILIKE $${paramIndex} OR 
        plan_name ILIKE $${paramIndex} OR 
        destination_region ILIKE $${paramIndex} OR
        insured_travelers::text ILIKE $${paramIndex}
      )`
      params.push(`%${search}%`)
      paramIndex++
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await pool.query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error: any) {
    console.error('Error al listar pólizas de seguro:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al obtener pólizas' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id = null,
      booking_id = null,
      tenant_id = 1,
      plan_code,
      plan_name,
      destination_region,
      start_date,
      end_date,
      total_days,
      passengers_count = 1,
      total_price,
      currency = 'USD',
      insured_travelers = [],
      emergency_contact = {},
      coverage_details = {}
    } = body

    if (!plan_code || !start_date || !end_date || !total_price) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan, fechas y monto son obligatorios para emitir la póliza.' 
      }, { status: 400 })
    }

    if (!insured_travelers || insured_travelers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Debe ingresar al menos un pasajero asegurado.' 
      }, { status: 400 })
    }

    // Generar número de póliza único (Ej. AS-POL-2026-8942)
    const year = new Date().getFullYear()
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    const policyNumber = `AS-POL-${year}-${randomSuffix}`

    const insertSql = `
      INSERT INTO travel_insurance_policies (
        policy_number,
        tenant_id,
        user_id,
        booking_id,
        plan_code,
        plan_name,
        destination_region,
        start_date,
        end_date,
        total_days,
        passengers_count,
        total_price,
        currency,
        insured_travelers,
        emergency_contact,
        coverage_details,
        status,
        payment_status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'active', 'completed', NOW(), NOW()
      ) RETURNING *
    `

    const values = [
      policyNumber,
      tenant_id,
      user_id,
      booking_id,
      plan_code,
      plan_name,
      destination_region,
      start_date,
      end_date,
      total_days || 1,
      insured_travelers.length || passengers_count,
      total_price,
      currency,
      JSON.stringify(insured_travelers),
      JSON.stringify(emergency_contact),
      JSON.stringify(coverage_details)
    ]

    const result = await pool.query(insertSql, values)
    const newPolicy = result.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Póliza emitida exitosamente.',
      data: newPolicy
    })
  } catch (error: any) {
    console.error('Error al emitir póliza de seguro:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al emitir póliza' 
    }, { status: 500 })
  }
}
