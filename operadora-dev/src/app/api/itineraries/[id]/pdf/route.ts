import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateItineraryPDF } from '@/lib/pdfGenerator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itineraryId } = await params

    // Obtener itinerario
    const result = await pool.query(
      'SELECT * FROM itineraries WHERE id = $1',
      [itineraryId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Itinerario no encontrado'
      }, { status: 404 })
    }

    const itinerary = result.rows[0]

    // Generar PDF
    const pdf = generateItineraryPDF(itinerary)
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
