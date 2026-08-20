'use client'

import { useState, useEffect } from 'react'
import { useLanguageCurrency, CURRENCY_OPTIONS, Language, CurrencyCode } from '@/contexts/LanguageCurrencyContext'
import { X, Check, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function LanguageCurrencyModal() {
    const { isModalOpen, closeModal, language, currency, setLanguage, setCurrency, t } = useLanguageCurrency()
    const { toast } = useToast()

    const [tempLang, setTempLang] = useState<Language>(language)
    const [tempCurr, setTempCurr] = useState<CurrencyCode>(currency)

    useEffect(() => {
        if (isModalOpen) {
            setTempLang(language)
            setTempCurr(currency)
        }
    }, [isModalOpen, language, currency])

    if (!isModalOpen) return null

    const handleApply = () => {
        setLanguage(tempLang)
        setCurrency(tempCurr)
        closeModal()
        toast({
            title: tempLang === 'es' ? '🌐 Configuración aplicada' : '🌐 Settings applied',
            description: tempLang === 'es'
                ? `Idioma establecido en Español • Divisa de visualización: ${tempCurr}`
                : `Language set to English • Display currency: ${tempCurr}`
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">
                        {tempLang === 'es' ? 'Selección de idioma y moneda' : 'Language and currency selection'}
                    </h2>
                    <button 
                        onClick={closeModal} 
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Section 1: Idioma */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">
                            {tempLang === 'es' ? 'Idioma' : 'Language'}
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTempLang('es')}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                                    tempLang === 'es'
                                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs'
                                        : 'border-gray-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tempLang === 'es' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-300'}`}>
                                    {tempLang === 'es' && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-base">🇲🇽</span>
                                <span>Español</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTempLang('en')}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                                    tempLang === 'en'
                                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs'
                                        : 'border-gray-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tempLang === 'en' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-300'}`}>
                                    {tempLang === 'en' && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="text-base">🇺🇸</span>
                                <span>English</span>
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Moneda */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">
                            {tempLang === 'es' ? 'Moneda' : 'Currency'}
                        </h3>

                        {/* Notice */}
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                            <Info className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                            <p>
                                {tempLang === 'es'
                                    ? 'Los precios se mostrarán en la moneda que selecciones. La moneda en la que pagas puede variar según la reserva.'
                                    : 'Prices will be displayed in the currency you select. The currency you pay in may vary depending on the booking.'
                                }
                            </p>
                        </div>

                        {/* Grid de 13 monedas (4 columnas en md) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            {CURRENCY_OPTIONS.map(c => {
                                const isSelected = tempCurr === c.code

                                return (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => setTempCurr(c.code)}
                                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                                            isSelected
                                                ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs'
                                                : 'border-gray-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-300'}`}>
                                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold text-[11px] truncate text-slate-900">{c.name}</p>
                                                <p className="text-[10px] text-slate-400 font-normal">{c.code}</p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-slate-50/50">
                    <button
                        type="button"
                        onClick={handleApply}
                        className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                        {tempLang === 'es' ? 'Aplicar' : 'Apply'}
                    </button>
                </div>
            </div>
        </div>
    )
}
