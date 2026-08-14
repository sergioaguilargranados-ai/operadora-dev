'use client'

import { useState } from 'react'
import { FileUp, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react'
import { SATParserService, FiscalDataSAT } from '@/services/SATParserService'

interface SATConstanciaUploaderProps {
    onDataExtracted: (data: FiscalDataSAT) => void
}

export function SATConstanciaUploader({ onDataExtracted }: SATConstanciaUploaderProps) {
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        setSuccessMsg(null)

        try {
            const text = await file.text()
            const parsed = SATParserService.parseText(text)

            // Simular delay y callback
            setTimeout(() => {
                onDataExtracted(parsed)
                setSuccessMsg(`Constancia analizada: RFC ${parsed.rfc} (${parsed.razonSocial})`)
                setLoading(false)
            }, 600)
        } catch (error) {
            console.error('Error al leer Constancia SAT:', error)
            setLoading(false)
        }
    }

    return (
        <div className="p-4 border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all text-center space-y-2">
            <input 
                type="file" 
                id="sat-constancia-input" 
                accept=".pdf,.txt,.html,.doc,.docx" 
                onChange={handleFileUpload}
                className="hidden" 
            />

            <label htmlFor="sat-constancia-input" className="cursor-pointer block space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                </div>

                <div>
                    <p className="text-xs font-bold text-slate-800">
                        Autocompletar con Constancia del SAT (PDF)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Sube tu Hoja de Situación Fiscal para cargar tus datos automáticamente
                    </p>
                </div>
            </label>

            {fileName && !loading && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{successMsg || fileName}</span>
                </div>
            )}
        </div>
    )
}
