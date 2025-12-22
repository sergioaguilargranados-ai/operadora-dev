import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface QuoteItem {
  category: string
  item_name: string
  description: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Quote {
  quote_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  title: string
  destination?: string
  travel_start_date?: string
  travel_end_date?: string
  total: number
  subtotal: number
  taxes: number
  discount: number
  currency: string
  notes?: string
  terms_conditions?: string
  items?: QuoteItem[]
  created_at: string
}

interface Activity {
  time: string
  title: string
  description: string
  location: string
}

interface Day {
  day: number
  date: string
  title: string
  activities: Activity[]
}

interface Itinerary {
  title: string
  destination: string
  description?: string
  start_date: string
  end_date: string
  days: Day[]
  notes?: string
  recommendations?: string
  created_at: string
}

/**
 * Genera PDF de cotización
 */
export function generateQuotePDF(quote: Quote): jsPDF {
  const doc = new jsPDF()

  // Configuración de colores
  const primaryColor: [number, number, number] = [0, 102, 255] // #0066FF
  const grayColor: [number, number, number] = [128, 128, 128]

  // Header con logo y título
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('AS OPERADORA', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Experiencias que inspiran', 105, 30, { align: 'center' })

  // Información de la cotización
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('COTIZACIÓN', 20, 55)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.text(`No. Cotización: ${quote.quote_number}`, 20, 62)
  doc.text(`Fecha: ${new Date(quote.created_at).toLocaleDateString('es-MX')}`, 20, 68)

  // Datos del cliente
  let yPos = 80
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('CLIENTE', 20, yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(quote.customer_name, 20, yPos + 6)
  doc.text(quote.customer_email, 20, yPos + 12)
  if (quote.customer_phone) {
    doc.text(quote.customer_phone, 20, yPos + 18)
  }

  // Detalles del viaje
  yPos += 30
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLES DEL VIAJE', 20, yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(quote.title, 20, yPos + 6)
  if (quote.destination) {
    doc.text(`Destino: ${quote.destination}`, 20, yPos + 12)
  }
  if (quote.travel_start_date && quote.travel_end_date) {
    doc.text(
      `Fechas: ${new Date(quote.travel_start_date).toLocaleDateString('es-MX')} - ${new Date(quote.travel_end_date).toLocaleDateString('es-MX')}`,
      20,
      yPos + 18
    )
  }

  // Tabla de items
  yPos += 30
  if (quote.items && quote.items.length > 0) {
    const tableData = quote.items.map(item => [
      item.item_name,
      item.description || '-',
      item.quantity.toString(),
      `$${item.unit_price.toLocaleString()}`,
      `$${item.subtotal.toLocaleString()}`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Servicio', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Totales
  const totalsX = 140
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, yPos)
  doc.text(`$${quote.subtotal.toLocaleString()} ${quote.currency}`, 185, yPos, { align: 'right' })

  if (quote.discount > 0) {
    yPos += 6
    doc.setTextColor(255, 0, 0)
    doc.text('Descuento:', totalsX, yPos)
    doc.text(`-$${quote.discount.toLocaleString()} ${quote.currency}`, 185, yPos, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  if (quote.taxes > 0) {
    yPos += 6
    doc.text('IVA:', totalsX, yPos)
    doc.text(`$${quote.taxes.toLocaleString()} ${quote.currency}`, 185, yPos, { align: 'right' })
  }

  yPos += 8
  doc.setDrawColor(...primaryColor)
  doc.line(140, yPos - 2, 190, yPos - 2)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('TOTAL:', totalsX, yPos + 4)
  doc.text(`$${quote.total.toLocaleString()} ${quote.currency}`, 185, yPos + 4, { align: 'right' })

  // Términos y condiciones
  yPos += 20
  if (quote.terms_conditions && yPos < 250) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TÉRMINOS Y CONDICIONES', 20, yPos)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const splitTerms = doc.splitTextToSize(quote.terms_conditions, 170)
    doc.text(splitTerms, 20, yPos + 6)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text('AS Operadora de Viajes y Eventos', 105, 280, { align: 'center' })
  doc.text('info@asoperadora.com | +52 55 1234 5678', 105, 285, { align: 'center' })

  return doc
}

/**
 * Genera PDF de itinerario
 */
export function generateItineraryPDF(itinerary: Itinerary): jsPDF {
  const doc = new jsPDF()

  const primaryColor: [number, number, number] = [0, 102, 255]
  const accentColor: [number, number, number] = [52, 152, 219]
  const grayColor: [number, number, number] = [128, 128, 128]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('AS OPERADORA', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Tu itinerario de viaje', 105, 30, { align: 'center' })

  // Título del viaje
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(itinerary.title, 105, 55, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.text(itinerary.destination, 105, 62, { align: 'center' })

  doc.setFontSize(10)
  doc.text(
    `${new Date(itinerary.start_date).toLocaleDateString('es-MX')} - ${new Date(itinerary.end_date).toLocaleDateString('es-MX')}`,
    105,
    68,
    { align: 'center' }
  )

  if (itinerary.description) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    const splitDesc = doc.splitTextToSize(itinerary.description, 170)
    doc.text(splitDesc, 105, 75, { align: 'center' })
  }

  let yPos = 90

  // Días del itinerario
  itinerary.days.forEach((day, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    // Header del día
    doc.setFillColor(...accentColor)
    doc.rect(20, yPos - 5, 170, 10, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`DÍA ${day.day} - ${day.title}`, 25, yPos + 2)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(day.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 170, yPos + 2, { align: 'right' })

    yPos += 12

    // Actividades
    day.activities.forEach((activity, actIndex) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setTextColor(...primaryColor)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`${activity.time}`, 25, yPos)

      doc.setTextColor(0, 0, 0)
      doc.text(activity.title, 45, yPos)

      if (activity.location) {
        doc.setFontSize(8)
        doc.setTextColor(...grayColor)
        doc.text(`📍 ${activity.location}`, 45, yPos + 4)
      }

      if (activity.description) {
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
        const splitDesc = doc.splitTextToSize(activity.description, 140)
        doc.text(splitDesc, 45, yPos + (activity.location ? 8 : 4))
        yPos += splitDesc.length * 4
      }

      yPos += 10
    })

    yPos += 5
  })

  // Notas y recomendaciones en nueva página
  if (itinerary.notes || itinerary.recommendations) {
    doc.addPage()
    yPos = 20

    if (itinerary.notes) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('NOTAS IMPORTANTES', 20, yPos)

      yPos += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      const splitNotes = doc.splitTextToSize(itinerary.notes, 170)
      doc.text(splitNotes, 20, yPos)
      yPos += splitNotes.length * 5 + 10
    }

    if (itinerary.recommendations) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('RECOMENDACIONES', 20, yPos)

      yPos += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      const splitRec = doc.splitTextToSize(itinerary.recommendations, 170)
      doc.text(splitRec, 20, yPos)
    }
  }

  // Footer en todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...grayColor)
    doc.text('AS Operadora de Viajes y Eventos', 105, 285, { align: 'center' })
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
  }

  return doc
}
