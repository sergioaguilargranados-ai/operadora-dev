/**
 * SATParserService.ts
 * Servicio para analizar y extraer campos fiscales de la Constancia de Situación Fiscal del SAT (México).
 */

export interface FiscalDataSAT {
    rfc: string
    razonSocial: string
    regimenFiscal: string // ej. 601, 605, 612, 626
    regimenNombre?: string
    codigoPostal: string
    calle?: string
    colonia?: string
    municipio?: string
    estado?: string
}

export class SATParserService {
    /**
     * Parsea texto crudo extraído de un archivo de Constancia de Situación Fiscal del SAT.
     */
    static parseText(text: string): FiscalDataSAT {
        const cleanText = text.replace(/\s+/g, ' ')

        // 1. Extraer RFC
        const rfcMatch = cleanText.match(/\b([A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3})\b/)
        const rfc = rfcMatch ? rfcMatch[1] : ''

        // 2. Extraer Razón Social / Nombre
        let razonSocial = ''
        const razonMatch = cleanText.match(/(?:Denominaci[oó]n|Raz[oó]n Social|Nombre\s*\(s\)\s*:\s*)([^:]+?)(?:R[eé]gimen|RFC|Fecha|Primer)/i)
        if (razonMatch) {
            razonSocial = razonMatch[1].trim()
        } else {
            // Intentar por patrones comunes
            const altRazon = cleanText.match(/(?:NOMBRE|RAZON SOCIAL)\s*:\s*([A-Z\s,.]+?)(?:RFC|REGIMEN)/i)
            if (altRazon) razonSocial = altRazon[1].trim()
        }

        // 3. Extraer Régimen Fiscal
        let regimenFiscal = '601'
        let regimenNombre = 'General de Ley Personas Morales'
        const regimenMatch = cleanText.match(/\b(601|603|605|606|612|616|621|625|626)\b/i)
        if (regimenMatch) {
            regimenFiscal = regimenMatch[1]
            const map: Record<string, string> = {
                '601': 'General de Ley Personas Morales',
                '603': 'Personas Morales con Fines no Lucrativos',
                '605': 'Sueldos y Salarios e Ingresos por Asimilados a Salarios',
                '606': 'Arrendamiento',
                '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
                '616': 'Sin obligaciones fiscales',
                '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
                '626': 'Régimen Simplificado de Confianza (RESICO)'
            }
            regimenNombre = map[regimenFiscal] || 'General'
        }

        // 4. Extraer Código Postal
        let codigoPostal = ''
        const cpMatch = cleanText.match(/(?:C[oó]digo Postal|C\.P\.)\s*:?\s*(\d{5})/i) || cleanText.match(/\b(\d{5})\b/)
        if (cpMatch) {
            codigoPostal = cpMatch[1]
        }

        return {
            rfc: rfc.toUpperCase(),
            razonSocial: razonSocial.toUpperCase() || 'PÚBLICO EN GENERAL',
            regimenFiscal,
            regimenNombre,
            codigoPostal: codigoPostal || '06600'
        }
    }
}
