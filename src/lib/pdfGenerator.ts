import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

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

async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    if (!url) return null
    if (url.startsWith('data:')) return url
    const res = await fetch(url)
    if (!res.ok) return null
    
    if (typeof window !== 'undefined') {
      const blob = await res.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } else {
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const mimeType = res.headers.get('content-type') || 'image/jpeg'
      return `data:${mimeType};base64,${buffer.toString('base64')}`
    }
  } catch (error) {
    console.error('Error converting image URL to base64:', error)
    return null
  }
}

/**
 * Genera PDF de itinerario
 */
export async function generateItineraryPDF(itinerary: any): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4')

  const primaryColor: [number, number, number] = [0, 51, 102]   // Deep Navy Blue
  const goldColor: [number, number, number] = [212, 175, 55]    // Gold
  const grayColor: [number, number, number] = [120, 120, 120]
  const lightGray: [number, number, number] = [240, 240, 240]

  // Get base64 for hero image
  let heroImageBase64 = null
  if (itinerary.hero_image) {
    heroImageBase64 = await imageUrlToBase64(itinerary.hero_image)
  }

  // Get base64 for QR Code
  let qrCodeBase64 = null
  try {
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://operadora.as')
    
    // We point the QR code to the mobile itinerary view
    const shareUrl = `${origin}/mobile/itinerario/${itinerary.booking_id || itinerary.id || ''}`
    qrCodeBase64 = await QRCode.toDataURL(shareUrl, { margin: 1, width: 100 })
  } catch (e) {
    console.error('Error generating QR code in pdfGenerator:', e)
  }

  // Extract variables
  const refCode = itinerary.booking_reference || `IT-${itinerary.id || '987654'}`
  const customerName = itinerary.lead_traveler_name || 'María Fernanda López González'
  const checkIn = itinerary.check_in || itinerary.start_date || '15/06/2026'
  const checkOut = itinerary.check_out || itinerary.end_date || '25/06/2026'
  
  const formatDateStr = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const checkInStr = formatDateStr(checkIn)
  const checkOutStr = formatDateStr(checkOut)
  
  const nights = checkIn && checkOut && !isNaN(new Date(checkIn).getTime()) && !isNaN(new Date(checkOut).getTime())
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : (itinerary.days?.length || 1)

  const guestCount = itinerary.adults ? (itinerary.adults + (itinerary.children || 0)) : 2

  // ----------------------------------------------------
  // DRAW PAGE 1 HEADER & SUMMARY BLOCK
  // ----------------------------------------------------

  // Header Logo AS (Times bold 36)
  doc.setFont('times', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(0, 0, 0)
  doc.text('AS', 15, 25)

  // Subtitle
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('OPERADORA DE VIAJES Y EVENTOS', 32, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text('AS Viajando', 32, 24)

  // Title on Right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...primaryColor)
  doc.text('ITINERARIO DE VIAJE', 195, 20, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  doc.text(`No. ${refCode}`, 195, 25, { align: 'right' })

  // Decorative Line
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.8)
  doc.line(15, 30, 195, 30)
  doc.setDrawColor(...goldColor)
  doc.setLineWidth(0.4)
  doc.line(15, 31, 195, 31)

  // Summary Box (3 columns)
  const summaryY = 38
  doc.setTextColor(0, 0, 0)

  // Column 1: Info de Reserva
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...primaryColor)
  doc.text('INFORMACIÓN DE LA RESERVA', 15, summaryY)
  
  doc.setFontSize(8)
  doc.setTextColor(50, 50, 50)
  let col1Y = summaryY + 5
  
  const drawLabelValue = (x: number, y: number, label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, x, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, x + 22, y)
  }
  
  drawLabelValue(15, col1Y, 'Localizador:', refCode)
  drawLabelValue(15, col1Y + 5, 'Fecha Res:', formatDateStr(itinerary.created_at || new Date().toISOString()))
  drawLabelValue(15, col1Y + 10, 'Titular:', customerName.length > 20 ? customerName.slice(0, 18) + '...' : customerName)
  drawLabelValue(15, col1Y + 15, 'Huéspedes:', `${guestCount} personas`)
  drawLabelValue(15, col1Y + 20, 'Destino:', itinerary.destination || 'Grecia')

  // Column 2: Rounded Image
  if (heroImageBase64) {
    try {
      doc.saveGraphicsState()
      doc.ellipse(105, 50, 22, 22, 'F')
      doc.clip()
      doc.addImage(heroImageBase64, 'JPEG', 83, 28, 44, 44)
      doc.restoreGraphicsState()
      
      // Gold Border
      doc.setDrawColor(...goldColor)
      doc.setLineWidth(0.8)
      doc.ellipse(105, 50, 22, 22, 'D')
    } catch (err) {
      console.error('Error rendering image in PDF:', err)
    }
  } else {
    // Draw empty circle with Gold Border and destination label
    doc.setDrawColor(...goldColor)
    doc.setFillColor(...lightGray)
    doc.setLineWidth(0.8)
    doc.ellipse(105, 50, 22, 22, 'FD')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...primaryColor)
    doc.text(itinerary.destination?.slice(0, 12) || 'Destino', 105, 51, { align: 'center' })
  }

  // Column 3: Resumen del Viaje
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...primaryColor)
  doc.text('RESUMEN DEL VIAJE', 140, summaryY)

  doc.setFontSize(8)
  doc.setTextColor(50, 50, 50)
  let col3Y = summaryY + 5
  
  const drawLabelValueCol3 = (x: number, y: number, label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, x, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, x + 20, y)
  }
  
  drawLabelValueCol3(140, col3Y, 'Salida:', checkInStr)
  drawLabelValueCol3(140, col3Y + 5, 'Regreso:', checkOutStr)
  drawLabelValueCol3(140, col3Y + 10, 'Noches:', `${nights} noches`)
  drawLabelValueCol3(140, col3Y + 15, 'Transporte:', 'Vuelo incluido')
  drawLabelValueCol3(140, col3Y + 20, 'Alimentos:', 'Desayuno incl.')

  // Separator Line under summary
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(15, 75, 195, 75)

  // ----------------------------------------------------
  // DRAW DAILY TIMELINE
  // ----------------------------------------------------
  let yPos = 82
  const daysList = itinerary.days || []

  daysList.forEach((day: any, index: number) => {
    // Estimate Day Height: description + activities
    const dayTitle = day.title || `Día ${index + 1}`
    const dayDesc = day.description || day.desc || ''
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const splitDesc = doc.splitTextToSize(dayDesc, 150)
    let dayHeight = 15 + splitDesc.length * 4.5
    
    // Add activities heights
    const activities = day.activities || []
    activities.forEach((act: any) => {
      const actTitle = act.title || ''
      const actDesc = act.description || ''
      const splitActDesc = doc.splitTextToSize(actDesc, 140)
      dayHeight += 6 + splitActDesc.length * 4.5
    })
    
    // Page break check
    if (yPos + dayHeight > 260) {
      doc.addPage()
      // Subpage header (smaller)
      doc.setFont('times', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(0, 0, 0)
      doc.text('AS', 15, 16)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...grayColor)
      doc.text(`Itinerario: ${itinerary.title}  |  Ref: ${refCode}`, 28, 14)
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.4)
      doc.line(15, 19, 195, 19)
      
      yPos = 26
    }

    // Draw Day Badge (Circle Grey)
    doc.setFillColor(230, 230, 230)
    doc.ellipse(22, yPos + 3, 6, 6, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(50, 50, 50)
    doc.text(`${index + 1}`, 22, yPos + 6, { align: 'center' })

    // Draw timeline connecting line if not the last item
    if (index < daysList.length - 1) {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(22, yPos + 9, 22, yPos + dayHeight + 2)
    }

    // Draw Day Info on Right
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text(dayTitle, 32, yPos + 4)
    
    // Date/Location subtitle
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...grayColor)
    const dayDate = day.date ? new Date(day.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }) : `Día ${index + 1}`
    const locationStr = day.places?.[0]?.name && day.places?.[0]?.name !== 'Ubicación' ? `  |  📍 ${day.places[0].name}` : ''
    doc.text(`${dayDate}${locationStr}`, 32, yPos + 8)

    // Description text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(60, 60, 60)
    doc.text(splitDesc, 32, yPos + 13)
    
    let actY = yPos + 13 + splitDesc.length * 4.5 + 2

    // Activities
    activities.forEach((act: any, actIdx: number) => {
      const actTime = act.time || '10:00'
      const actTitle = act.title || 'Actividad'
      const actDesc = act.description || ''
      const splitActDesc = doc.splitTextToSize(actDesc, 140)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...primaryColor)
      doc.text(`•  ${actTime}`, 32, actY)
      doc.setTextColor(30, 30, 30)
      doc.text(actTitle, 47, actY)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(80, 80, 80)
      doc.text(splitActDesc, 47, actY + 4)

      actY += 5 + splitActDesc.length * 4
    })

    yPos = actY + 4
  })

  // ----------------------------------------------------
  // DRAW LAST PAGE: NOTES, RECOMMENDATIONS, QR & CONTACT
  // ----------------------------------------------------
  if (itinerary.notes || itinerary.recommendations || qrCodeBase64) {
    // Page break or space check
    if (yPos > 210) {
      doc.addPage()
      // Subpage header
      doc.setFont('times', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(0, 0, 0)
      doc.text('AS', 15, 16)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...grayColor)
      doc.text(`Itinerario: ${itinerary.title}  |  Ref: ${refCode}`, 28, 14)
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.4)
      doc.line(15, 19, 195, 19)
      
      yPos = 26
    } else {
      // Separator line
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(15, yPos, 195, yPos)
      yPos += 8
    }

    // Notes
    if (itinerary.notes) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...primaryColor)
      doc.text('NOTAS IMPORTANTES', 15, yPos)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(70, 70, 70)
      const splitNotes = doc.splitTextToSize(itinerary.notes, 120)
      doc.text(splitNotes, 15, yPos + 5)
      yPos += 5 + splitNotes.length * 4.2 + 5
    }

    // Recommendations
    if (itinerary.recommendations) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...primaryColor)
      doc.text('RECOMENDACIONES DE VIAJE', 15, yPos)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(70, 70, 70)
      const splitRecs = doc.splitTextToSize(itinerary.recommendations, 120)
      doc.text(splitRecs, 15, yPos + 5)
      yPos += 5 + splitRecs.length * 4.2 + 5
    }

    // QR Code Placement (Right side bottom)
    if (qrCodeBase64) {
      const qrX = 150
      const qrY = yPos - 35 > 100 ? yPos - 35 : 200 // Position dynamically
      
      try {
        doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, 32, 32)
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...primaryColor)
        doc.text('ITINERARIO INTERACTIVO', qrX + 16, qrY + 36, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.text('Escanea para ver en PWA', qrX + 16, qrY + 39, { align: 'center' })
      } catch (err) {
        console.error('Error drawing QR code in PDF:', err)
      }
    }
  }

  // ----------------------------------------------------
  // DRAW FOOTER ON ALL PAGES
  // ----------------------------------------------------
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Navy Footer Bar
    doc.setFillColor(...primaryColor)
    doc.rect(15, 276, 180, 7, 'F')
    
    // White text inside
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text('Soporte AS Concierge: +52 55 1234 5678  |  soporte@asoperadora.com  |  www.asoperadora.com', 105, 280.5, { align: 'center' })
    
    // Page count
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...grayColor)
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
  }

  return doc
}
