'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Language = 'es' | 'en'

export type CurrencyCode =
    | 'MXN'
    | 'USD'
    | 'COP'
    | 'CAD'
    | 'EUR'
    | 'ARS'
    | 'BRL'
    | 'CLP'
    | 'CNY'
    | 'GBP'
    | 'JPY'
    | 'PEN'
    | 'UYU'

export interface CurrencyOption {
    code: CurrencyCode
    name: string
    symbol: string
    flag: string
    rateAgainstMXN: number // Cuántos MXN equivale 1 unidad de esta moneda
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
    { code: 'MXN', name: 'Peso mexicano', symbol: '$', flag: '🇲🇽', rateAgainstMXN: 1.0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rateAgainstMXN: 20.5 },
    { code: 'COP', name: 'Peso colombiano', symbol: '$', flag: '🇨🇴', rateAgainstMXN: 0.0048 },
    { code: 'CAD', name: 'Canadian dollar', symbol: '$', flag: '🇨🇦', rateAgainstMXN: 14.8 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateAgainstMXN: 22.2 },
    { code: 'ARS', name: 'Peso argentino', symbol: '$', flag: '🇦🇷', rateAgainstMXN: 0.016 },
    { code: 'BRL', name: 'Reais brasileiros', symbol: 'R$', flag: '🇧🇷', rateAgainstMXN: 3.6 },
    { code: 'CLP', name: 'Peso chileno', symbol: '$', flag: '🇨🇱', rateAgainstMXN: 0.021 },
    { code: 'CNY', name: 'Yuan (人民币)', symbol: '¥', flag: '🇨🇳', rateAgainstMXN: 2.8 },
    { code: 'GBP', name: 'Pound sterling', symbol: '£', flag: '🇬🇧', rateAgainstMXN: 26.4 },
    { code: 'JPY', name: 'Yen (円)', symbol: '¥', flag: '🇯🇵', rateAgainstMXN: 0.13 },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/', flag: '🇵🇪', rateAgainstMXN: 5.4 },
    { code: 'UYU', name: 'Peso uruguayo', symbol: '$', flag: '🇺🇾', rateAgainstMXN: 0.49 }
]

export interface ConvertedPrice {
    amount: number
    currency: CurrencyCode
    symbol: string
    formatted: string
}

interface LanguageCurrencyContextType {
    language: Language
    currency: CurrencyCode
    isModalOpen: boolean
    setLanguage: (lang: Language) => void
    setCurrency: (curr: CurrencyCode) => void
    openModal: () => void
    closeModal: () => void
    formatPrice: (amount: number, fromCurrency?: string) => string
    convertPrice: (amount: number, fromCurrency?: string) => ConvertedPrice
    t: (key: string) => string
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | undefined>(undefined)

const TRANSLATIONS: Record<Language, Record<string, string>> = {
    es: {
        'nav.app': 'Obtén la app',
        'nav.reservations': 'Tus Reservas',
        'nav.help': 'Ayuda',
        'nav.operation': 'Operación',
        'nav.profile': 'Perfil',
        'nav.logout': 'Cerrar sesión',
        'modal.title': 'Selección de idioma y moneda',
        'modal.language': 'Idioma',
        'modal.currency': 'Moneda',
        'modal.notice': 'Los precios se mostrarán en la moneda que selecciones. La moneda en la que pagas puede variar según la reserva.',
        'modal.apply': 'Aplicar'
    },
    en: {
        'nav.app': 'Get the app',
        'nav.reservations': 'Your Bookings',
        'nav.help': 'Help',
        'nav.operation': 'Operation',
        'nav.profile': 'Profile',
        'nav.logout': 'Sign out',
        'modal.title': 'Language and currency selection',
        'modal.language': 'Language',
        'modal.currency': 'Currency',
        'modal.notice': 'Prices will be displayed in the currency you select. The currency you pay in may vary depending on the booking.',
        'modal.apply': 'Apply'
    }
}

// Función para disparar la traducción en Google Translate en el DOM y cookies
export function triggerGoogleTranslate(langCode: string) {
    if (typeof window === 'undefined') return

    try {
        // 1. Configurar cookies de Google Translate para el dominio actual
        const host = window.location.hostname
        const cookieVal = langCode === 'es' ? '/es/es' : `/es/${langCode}`
        
        document.cookie = `googtrans=${cookieVal};path=/;`
        document.cookie = `googtrans=${cookieVal};path=/;domain=${host};`
        document.cookie = `googtrans=${cookieVal};path=/;domain=.${host};`

        // 2. Disparar el cambio en el selector generado por Google Translate
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
        if (select) {
            select.value = langCode
            select.dispatchEvent(new Event('change'))
        } else {
            // Reintento si el script aún se está inicializando
            setTimeout(() => {
                const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement
                if (retrySelect) {
                    retrySelect.value = langCode
                    retrySelect.dispatchEvent(new Event('change'))
                }
            }, 600)
        }
    } catch (e) {
        console.warn('Error activating Google Translate:', e)
    }
}

export function LanguageCurrencyProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es')
    const [currency, setCurrencyState] = useState<CurrencyCode>('MXN')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem('as_lang') as Language
        const savedCurr = localStorage.getItem('as_curr') as CurrencyCode
        
        if (savedLang && ['es', 'en'].includes(savedLang)) {
            setLanguageState(savedLang)
            if (savedLang !== 'es') {
                setTimeout(() => triggerGoogleTranslate(savedLang), 800)
            }
        }
        if (savedCurr && CURRENCY_OPTIONS.some(c => c.code === savedCurr)) {
            setCurrencyState(savedCurr)
        }
    }, [])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('as_lang', lang)
        triggerGoogleTranslate(lang)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }))
    }, [])

    const setCurrency = useCallback((curr: CurrencyCode) => {
        setCurrencyState(curr)
        localStorage.setItem('as_curr', curr)
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: curr } }))
    }, [])

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    /**
     * Convierte un monto numérico desde cualquier moneda base (MXN, USD, etc.) a la moneda seleccionada
     */
    const convertPrice = useCallback((amount: number, fromCurrency: string = 'MXN'): ConvertedPrice => {
        const fromUpper = (fromCurrency || 'MXN').toUpperCase()
        const fromOption = CURRENCY_OPTIONS.find(c => c.code === fromUpper) || CURRENCY_OPTIONS[0]
        const toOption = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0]

        // 1. Convertir a MXN como pivote central
        const amountInMXN = amount * fromOption.rateAgainstMXN

        // 2. Convertir de MXN a la moneda destino
        const targetAmount = amountInMXN / toOption.rateAgainstMXN
        const rounded = Math.round((targetAmount + Number.EPSILON) * 100) / 100

        const formatted = new Intl.NumberFormat(language === 'es' ? 'es-MX' : 'en-US', {
            style: 'currency',
            currency: toOption.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(rounded)

        return {
            amount: rounded,
            currency: toOption.code,
            symbol: toOption.symbol,
            formatted
        }
    }, [currency, language])

    const formatPrice = useCallback((amount: number, fromCurrency: string = 'MXN'): string => {
        return convertPrice(amount, fromCurrency).formatted
    }, [convertPrice])

    const t = useCallback((key: string): string => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.es[key] || key
    }, [language])

    return (
        <LanguageCurrencyContext.Provider value={{
            language,
            currency,
            isModalOpen,
            setLanguage,
            setCurrency,
            openModal,
            closeModal,
            formatPrice,
            convertPrice,
            t
        }}>
            {children}
        </LanguageCurrencyContext.Provider>
    )
}

export function useLanguageCurrency() {
    const context = useContext(LanguageCurrencyContext)
    if (!context) {
        throw new Error('useLanguageCurrency must be used within a LanguageCurrencyProvider')
    }
    return context
}
