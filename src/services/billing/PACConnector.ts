/**
 * PACConnector.ts
 * Interfaz unificada para conectores de PAC (Proveedores Autorizados de Certificación)
 * Permite intercambiar de PAC (Facturama, Finkok, SW Sapien, etc.) de forma transparente.
 */

export interface FiscalReceiver {
    rfc: string
    name: string
    fiscalRegime: string
    taxZipCode: string
    cfdiUse?: string
    email?: string
}

export interface InvoiceItemPayload {
    description: string
    quantity: number
    unitCode?: string
    unitName?: string
    unitPrice: number
    amount: number
    satProductCode?: string
    discount?: number
}

export interface CFDIInvoicePayload {
    cfdiType: 'I' | 'P' | 'E' // Ingreso, Pago, Egreso
    expeditionPlace: string
    paymentForm: string       // SAT: 01, 03, 04, 28, 99
    paymentMethod: string     // SAT: PUE, PPD
    currency: string          // MXN, USD
    exchangeRate?: number
    receiver: FiscalReceiver
    items: InvoiceItemPayload[]
    subtotal: number
    tax: number
    total: number
    totalConLetra?: string
    notes?: string
}

export interface PaymentComplementPayload {
    expeditionPlace: string
    paymentDate: string        // YYYY-MM-DD
    paymentForm: string        // SAT: 01, 03, 04, etc.
    amount: number
    currency?: string
    receiver: FiscalReceiver
    relatedDocuments: Array<{
        uuid: string
        serie?: string
        folio?: string
        currency?: string
        partialityNumber: number
        previousBalance: number
        amountPaid: number
        remainingBalance: number
    }>
}

export interface PACResponse {
    success: boolean
    facturamaId?: string
    uuid?: string
    xmlBase64?: string
    pdfBase64?: string
    error?: string
    rawResponse?: any
}

export interface PACConnector {
    name: string
    testConnection(credentials: any): Promise<{ success: boolean; error?: string }>
    createCFDI(companyConfig: any, payload: CFDIInvoicePayload): Promise<PACResponse>
    cancelCFDI(companyConfig: any, facturamaIdOrUuid: string, motive: string, uuidReplacement?: string): Promise<PACResponse>
    createPaymentComplement(companyConfig: any, payload: PaymentComplementPayload): Promise<PACResponse>
    getInvoiceFile(companyConfig: any, facturamaIdOrUuid: string, format: 'pdf' | 'xml'): Promise<string | null>
}
