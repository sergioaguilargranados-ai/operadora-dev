import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateItineraryPDF } from '@/lib/pdfGenerator'

export async function POST(request: NextRequest) {
  try {
    const { proposal_id } = await request.json()

    if (!proposal_id) {
      return NextResponse.json({ success: false, error: 'ID de propuesta requerido' }, { status: 400 })
    }

    // 1. Obtener propuesta y sus días
    const proposalRes = await pool.query(
      `SELECT * FROM ai_trip_proposals WHERE id = $1`,
      [proposal_id]
    )
    const proposal = proposalRes.rows[0]

    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Propuesta no encontrada' }, { status: 404 })
    }

    const daysRes = await pool.query(
      `SELECT * FROM ai_trip_days WHERE proposal_id = $1 ORDER BY day_number`,
      [proposal_id]
    )
    const days = daysRes.rows

    // 2. Mapear a formato Itinerary del PDF Generator
    const itineraryData = {
      title: proposal.folio + ": " + (proposal.ai_itinerary?.itinerary_title || `Viaje a ${proposal.destination}`),
      destination: proposal.destination,
      description: proposal.ai_itinerary?.summary || `Propuesta personalizada para ${proposal.traveler_name}`,
      start_date: proposal.start_date || new Date().toISOString(),
      end_date: proposal.end_date || new Date(Date.now() + (proposal.duration_nights || 7) * 86400000).toISOString(),
      days: days.map(day => ({
        day: day.day_number,
        date: day.date || new Date().toISOString(),
        title: day.title,
        activities: (day.activities || []).map((act: any) => ({
          time: act.time || '--:--',
          title: act.name,
          description: act.description,
          location: day.city
        }))
      })),
      notes: proposal.ai_itinerary?.important_notes?.join('\n') || '',
      recommendations: proposal.ai_itinerary?.packing_tips?.join(', ') || '',
      created_at: proposal.created_at
    }

    // 3. Generar PDF
    const doc = generateItineraryPDF(itineraryData)
    const pdfOutput = doc.output('arraybuffer')

    // 4. Retornar como PDF
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/json', // Lo enviamos como JSON base64 o Blob? 
                                          // Mejor como PDF directo
        'Content-Disposition': `attachment; filename="Itinerario-${proposal.folio}.pdf"`,
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    })

  } catch (error: any) {
    console.error('[PDF-EXPORT] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
