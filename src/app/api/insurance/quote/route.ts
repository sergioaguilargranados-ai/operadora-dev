import { NextRequest, NextResponse } from 'next/server'

export interface InsurancePlanQuote {
  plan_code: string
  plan_name: string
  badge?: string
  medical_coverage: string
  schengen_compliant: boolean
  covid_covered: boolean
  luggage_coverage: string
  trip_cancellation: string
  delay_coverage: string
  legal_assistance: string
  pre_existing_emergency: string
  daily_rate_usd: number
  total_price_usd: number
  total_price_mxn: number
  features: string[]
}

const EXCHANGE_RATE_MXN = 19.80

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      destination_region = 'europa_schengen', 
      start_date, 
      end_date, 
      passengers = [] 
    } = body

    if (!start_date || !end_date) {
      return NextResponse.json({ 
        success: false, 
        error: 'Las fechas de salida y regreso son obligatorias.' 
      }, { status: 400 })
    }

    const start = new Date(start_date)
    const end = new Date(end_date)
    const diffTime = end.getTime() - start.getTime()
    let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (isNaN(totalDays) || totalDays < 1) {
      totalDays = 1
    }

    // Calcular factor de edad ponderado
    let ageMultiplier = 1.0
    const passengerCount = Math.max(passengers.length, 1)

    if (passengers.length > 0) {
      let sumMultiplier = 0
      passengers.forEach((p: any) => {
        let age = 30
        if (p.birth_date) {
          const birth = new Date(p.birth_date)
          const now = new Date()
          age = now.getFullYear() - birth.getFullYear()
        } else if (typeof p.age === 'number') {
          age = p.age
        }

        if (age >= 75) {
          sumMultiplier += 2.0
        } else if (age >= 65) {
          sumMultiplier += 1.5
        } else {
          sumMultiplier += 1.0
        }
      })
      ageMultiplier = sumMultiplier / passengers.length
    }

    // Factor de destino
    let regionFactor = 1.0
    if (destination_region === 'nacional') {
      regionFactor = 0.65
    } else if (destination_region === 'usa_canada' || destination_region === 'cruceros') {
      regionFactor = 1.35
    } else if (destination_region === 'mundial' || destination_region === 'asia_oceania') {
      regionFactor = 1.20
    } else {
      // europa_schengen / sudamerica
      regionFactor = 1.0
    }

    // Base rates per day in USD
    const baseRateBasic = 3.50 * regionFactor
    const baseRatePlus = 6.80 * regionFactor
    const baseRatePlatinum = 11.50 * regionFactor

    // Min price thresholds
    const minDays = Math.max(totalDays, 3)

    const calcTotal = (rate: number) => {
      const singlePaxTotal = Math.max(rate * minDays * ageMultiplier, 15)
      return Math.round(singlePaxTotal * passengerCount * 100) / 100
    }

    const totalBasicUsd = calcTotal(baseRateBasic)
    const totalPlusUsd = calcTotal(baseRatePlus)
    const totalPlatinumUsd = calcTotal(baseRatePlatinum)

    const plans: InsurancePlanQuote[] = [
      {
        plan_code: 'PLAN_BASIC',
        plan_name: 'Plan Escapadas / Básico',
        medical_coverage: '$30,000 USD',
        schengen_compliant: false,
        covid_covered: true,
        luggage_coverage: '$500 USD',
        trip_cancellation: '$300 USD',
        delay_coverage: '$150 USD',
        legal_assistance: '$1,000 USD',
        pre_existing_emergency: '$1,000 USD',
        daily_rate_usd: Math.round(baseRateBasic * 100) / 100,
        total_price_usd: totalBasicUsd,
        total_price_mxn: Math.round(totalBasicUsd * EXCHANGE_RATE_MXN),
        features: [
          'Gastos médicos por accidente o enfermedad $30k USD',
          'Atención médica COVID-19 y telemedicina',
          'Odontología de urgencia hasta $300 USD',
          'Pérdida o extravío de equipaje documentado $500 USD',
          'Central de Asistencia 24/7 en español'
        ]
      },
      {
        plan_code: 'PLAN_PLUS_SCHENGEN',
        plan_name: 'Plan Internacional Plus (Schengen ⭐)',
        badge: 'RECOMENDADO',
        medical_coverage: '$60,000 USD',
        schengen_compliant: true,
        covid_covered: true,
        luggage_coverage: '$1,200 USD',
        trip_cancellation: '$1,000 USD',
        delay_coverage: '$300 USD',
        legal_assistance: '$3,000 USD',
        pre_existing_emergency: '$3,000 USD',
        daily_rate_usd: Math.round(baseRatePlus * 100) / 100,
        total_price_usd: totalPlusUsd,
        total_price_mxn: Math.round(totalPlusUsd * EXCHANGE_RATE_MXN),
        features: [
          'Cumple con los 30,000 EUR del Tratado Schengen sin deducible',
          'Gastos médicos hospitalarios hasta $60,000 USD',
          'Repatriación médica y funeraria ilimitada',
          'Compensación por demora o cancelación de vuelo',
          'Compensación por robo o pérdida de equipaje $1,200 USD',
          'Asistencia legal y adelanto de fianzas en el extranjero',
          'Garantía de reembolso total ante cancelación previa del viaje'
        ]
      },
      {
        plan_code: 'PLAN_PLATINUM_TOTAL',
        plan_name: 'Plan Mundial Platinum & Cruceros',
        badge: 'MÁXIMA COBERTURA',
        medical_coverage: '$150,000 USD',
        schengen_compliant: true,
        covid_covered: true,
        luggage_coverage: '$2,000 USD',
        trip_cancellation: '$2,000 USD',
        delay_coverage: '$500 USD',
        legal_assistance: '$5,000 USD',
        pre_existing_emergency: '$10,000 USD',
        daily_rate_usd: Math.round(baseRatePlatinum * 100) / 100,
        total_price_usd: totalPlatinumUsd,
        total_price_mxn: Math.round(totalPlatinumUsd * EXCHANGE_RATE_MXN),
        features: [
          'Cobertura médica integral hasta $150,000 USD para EE.UU., Cruceros y Mundo',
          'Preexistencias agudas y estabilización hasta $10,000 USD',
          'Práctica de deportes recreativos y de aventura incluida',
          'Cancelación e interrupción de viaje por fuerza mayor $2,000 USD',
          'Gastos de hotel por convalecencia médica prolongada',
          'Acompañamiento y traslado de menores en viaje',
          'Asistencia médica prioritaria VIP 24/7 vía WhatsApp y llamada satelital'
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        destination_region,
        start_date,
        end_date,
        total_days: totalDays,
        passengers_count: passengerCount,
        exchange_rate_mxn: EXCHANGE_RATE_MXN,
        plans
      }
    })
  } catch (error: any) {
    console.error('Error al cotizar seguro de viaje:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al calcular cotización de seguro' 
    }, { status: 500 })
  }
}
