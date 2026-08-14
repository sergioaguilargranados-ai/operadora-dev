import { PACConnector, CFDIInvoicePayload, PaymentComplementPayload, PACResponse } from './PACConnector'
import { queryOne } from '@/lib/db'

const API_URL_SANDBOX = 'https://apisandbox.facturama.mx'
const API_URL_PRODUCTION = 'https://api.facturama.mx'

export class FacturamaPACConnector implements PACConnector {
    name = 'facturama'

    private getAuthHeaders(user: string, pass: string, isSandbox: boolean) {
        const authString = `${user}:${pass}`
        return {
            headers: {
                'Authorization': `Basic ${Buffer.from(authString).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            baseUrl: isSandbox ? API_URL_SANDBOX : API_URL_PRODUCTION
        }
    }

    async testConnection(credentials: any): Promise<{ success: boolean; error?: string }> {
        try {
            const { api_user, api_password, is_sandbox } = credentials
            const { headers, baseUrl } = this.getAuthHeaders(api_user, api_password, is_sandbox)

            const res = await fetch(`${baseUrl}/client?limit=1`, { method: 'GET', headers })
            if (!res.ok) {
                if (res.status === 401) return { success: false, error: 'Credenciales inválidas (401)' }
                return { success: false, error: `Error ${res.status} al conectar a Facturama` }
            }
            return { success: true }
        } catch (e: any) {
            return { success: false, error: e.message }
        }
    }

    async createCFDI(config: any, payload: CFDIInvoicePayload): Promise<PACResponse> {
        try {
            const { headers, baseUrl } = this.getAuthHeaders(config.pac_api_user, config.pac_api_password, config.pac_is_sandbox)

            const facturamaPayload = {
                Issuer: {
                    Rfc: config.rfc.toUpperCase().trim(),
                    Name: config.razon_social.toUpperCase().trim(),
                    FiscalRegime: config.regimen_fiscal
                },
                Receiver: {
                    Rfc: payload.receiver.rfc.toUpperCase().trim(),
                    Name: payload.receiver.name.toUpperCase().trim(),
                    CfdiUse: payload.receiver.cfdiUse || 'G03',
                    FiscalRegime: payload.receiver.fiscalRegime,
                    TaxZipCode: payload.receiver.taxZipCode
                },
                CfdiType: payload.cfdiType || 'I',
                PaymentForm: payload.paymentForm || '03',
                PaymentMethod: payload.paymentMethod || 'PUE',
                ExpeditionPlace: payload.expeditionPlace || config.codigo_postal,
                Currency: payload.currency || 'MXN',
                Items: payload.items.map(item => ({
                    ProductCode: item.satProductCode || '90111501',
                    IdentificationNumber: 'SER-001',
                    Description: item.description,
                    Unit: item.unitName || 'Servicio',
                    UnitCode: item.unitCode || 'E48',
                    UnitPrice: Number(item.unitPrice.toFixed(2)),
                    Quantity: item.quantity,
                    Subtotal: Number(item.amount.toFixed(2)),
                    Taxes: [
                        {
                            Name: 'IVA',
                            Rate: 0.160000,
                            Total: Number((item.amount * 0.16).toFixed(2)),
                            Base: Number(item.amount.toFixed(2)),
                            IsRetention: false,
                            IsFederalTax: true
                        }
                    ],
                    Total: Number((item.amount * 1.16).toFixed(2))
                }))
            }

            const res = await fetch(`${baseUrl}/3/cfdis`, {
                method: 'POST',
                headers,
                body: JSON.stringify(facturamaPayload)
            })

            const data = await res.json()

            if (!res.ok) {
                let err = data?.Message || `Error al timbrar (${res.status})`
                if (data?.ModelState) {
                    const details = Object.entries(data.ModelState).map(([f, e]: any) => `${f}: ${e.join(', ')}`).join(' | ')
                    err += ` (${details})`
                }
                return { success: false, error: err, rawResponse: data }
            }

            return {
                success: true,
                facturamaId: data.Id,
                uuid: data.Complement?.TaxStamp?.Uuid,
                rawResponse: data
            }
        } catch (e: any) {
            console.error('Facturama createCFDI error:', e)
            return { success: false, error: e.message }
        }
    }

    async cancelCFDI(config: any, facturamaId: string, motive = '02', uuidReplacement?: string): Promise<PACResponse> {
        try {
            const { headers, baseUrl } = this.getAuthHeaders(config.pac_api_user, config.pac_api_password, config.pac_is_sandbox)

            const params = new URLSearchParams({ type: 'issued', motive })
            if (uuidReplacement) params.append('uuidReplacement', uuidReplacement)

            const res = await fetch(`${baseUrl}/cfdi/${facturamaId}?${params}`, {
                method: 'DELETE',
                headers
            })

            const data = await res.json()
            if (!res.ok) {
                return { success: false, error: data?.Message || `Error al cancelar (${res.status})` }
            }

            return { success: true, rawResponse: data }
        } catch (e: any) {
            return { success: false, error: e.message }
        }
    }

    async createPaymentComplement(config: any, payload: PaymentComplementPayload): Promise<PACResponse> {
        try {
            const { headers, baseUrl } = this.getAuthHeaders(config.pac_api_user, config.pac_api_password, config.pac_is_sandbox)
            const round2 = (n: number) => Number(Math.round(Number(n + "e+2")) + "e-2")

            const relatedDocs = payload.relatedDocuments.map(doc => {
                const baseAmount = round2(doc.amountPaid / 1.16)
                const taxAmount = round2(doc.amountPaid - baseAmount)

                return {
                    TaxObject: "02",
                    Uuid: doc.uuid,
                    Serie: doc.serie || "A",
                    Folio: doc.folio || "",
                    Currency: doc.currency || "MXN",
                    PaymentMethod: "PPD",
                    PartialityNumber: doc.partialityNumber || 1,
                    PreviousBalanceAmount: round2(doc.previousBalance),
                    AmountPaid: round2(doc.amountPaid),
                    ImpSaldoInsoluto: round2(doc.remainingBalance),
                    Taxes: [{
                        Name: "IVA",
                        Rate: 0.160000,
                        Total: taxAmount,
                        Base: baseAmount,
                        IsRetention: false,
                        IsFederalTax: true
                    }]
                }
            })

            const paymentPayload = {
                CfdiType: "P",
                ExpeditionPlace: payload.expeditionPlace || config.codigo_postal,
                Exportation: "01",
                Receiver: {
                    Rfc: payload.receiver.rfc.toUpperCase().trim(),
                    Name: payload.receiver.name.toUpperCase().trim(),
                    CfdiUse: "CP01",
                    FiscalRegime: payload.receiver.fiscalRegime,
                    TaxZipCode: payload.receiver.taxZipCode
                },
                Complemento: {
                    Payments: [{
                        Date: payload.paymentDate,
                        PaymentForm: payload.paymentForm,
                        Amount: round2(payload.amount),
                        Currency: payload.currency || "MXN",
                        RelatedDocuments: relatedDocs
                    }]
                }
            }

            const res = await fetch(`${baseUrl}/3/cfdis`, {
                method: 'POST',
                headers,
                body: JSON.stringify(paymentPayload)
            })

            const data = await res.json()
            if (!res.ok) {
                return { success: false, error: data?.Message || `Error al timbrar complemento (${res.status})` }
            }

            return {
                success: true,
                facturamaId: data.Id,
                uuid: data.Complement?.TaxStamp?.Uuid,
                rawResponse: data
            }
        } catch (e: any) {
            return { success: false, error: e.message }
        }
    }

    async getInvoiceFile(config: any, facturamaId: string, format: 'pdf' | 'xml'): Promise<string | null> {
        try {
            const { headers, baseUrl } = this.getAuthHeaders(config.pac_api_user, config.pac_api_password, config.pac_is_sandbox)
            const res = await fetch(`${baseUrl}/cfdi/${format}/issued/${facturamaId}`, {
                method: 'GET',
                headers
            })

            if (!res.ok) return null
            const data = await res.json()
            return data.Content || null
        } catch {
            return null
        }
    }
}
