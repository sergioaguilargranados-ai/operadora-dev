import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateQuotePDF } from '@/lib/pdfGenerator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params

    // Obtener cotización con items
    const quoteResult = await pool.query(
      'SELECT * FROM quotes WHERE id = $1',
      [quoteId]
    )

    if (quoteResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cotización no encontrada'
      }, { status: 404 })
    }

    const quote = quoteResult.rows[0]

    // Obtener items
    const itemsResult = await pool.query(
      'SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order',
      [quoteId]
    )

    quote.items = itemsResult.rows

    // Generar PDF
    const pdf = generateQuotePDF(quote)
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Actualizar URL del PDF en BD (opcional)
    // En producción guardarías el PDF en S3/Cloudinary
    const pdfUrl = `/api/quotes/${quoteId}/pdf`
    await pool.query(
      'UPDATE quotes SET pdf_url = $1, pdf_generated_at = NOW() WHERE id = $2',
      [pdfUrl, quoteId]
    )

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Cotizacion_${quote.quote_number}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
