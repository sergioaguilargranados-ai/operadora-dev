import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateItineraryPDF } from '@/lib/pdfGenerator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itineraryId } = await params

    // Obtener itinerario con left join de la reserva para datos consolidados
    const result = await pool.query(`
      SELECT i.*, 
             b.booking_reference, 
             b.lead_traveler_name, 
             b.lead_traveler_email,
             b.lead_traveler_phone,
             b.check_in, 
             b.check_out, 
             b.adults, 
             b.children, 
             b.special_requests,
             b.traveler_info,
             b.booking_details
      FROM itineraries i
      LEFT JOIN bookings b ON i.booking_id = b.id
      WHERE i.id = $1
    `, [itineraryId])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Itinerario no encontrado'
      }, { status: 404 })
    }

    const itinerary = result.rows[0]
    
    // Parse JSON fields if they are strings
    if (itinerary.days && typeof itinerary.days === 'string') {
      try {
        itinerary.days = JSON.parse(itinerary.days)
      } catch (e) {
        itinerary.days = []
      }
    }

    // Generar PDF
    const pdf = await generateItineraryPDF(itinerary)
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Actualizar URL del PDF en BD
    const pdfUrl = `/api/itineraries/${itineraryId}/pdf`
    await pool.query(
      'UPDATE itineraries SET pdf_url = $1, pdf_generated_at = NOW() WHERE id = $2',
      [pdfUrl, itineraryId]
    )

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Itinerario_${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('Error generating itinerary PDF:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
