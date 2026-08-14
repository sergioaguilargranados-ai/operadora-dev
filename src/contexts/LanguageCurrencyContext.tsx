'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

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
    rateAgainstMXN: number // Cuántos MXN equivale 1 de esta moneda
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

interface LanguageCurrencyContextType {
    language: Language
    currency: CurrencyCode
    isModalOpen: boolean
    setLanguage: (lang: Language) => void
    setCurrency: (curr: CurrencyCode) => void
    openModal: () => void
    closeModal: () => void
    formatPrice: (amountMXN: number) => string
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

export function LanguageCurrencyProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es')
    const [currency, setCurrencyState] = useState<CurrencyCode>('MXN')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem('as_lang') as Language
        const savedCurr = localStorage.getItem('as_curr') as CurrencyCode
        if (savedLang && ['es', 'en'].includes(savedLang)) setLanguageState(savedLang)
        if (savedCurr && CURRENCY_OPTIONS.some(c => c.code === savedCurr)) setCurrencyState(savedCurr)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('as_lang', lang)
    }

    const setCurrency = (curr: CurrencyCode) => {
        setCurrencyState(curr)
        localStorage.setItem('as_curr', curr)
    }

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    const formatPrice = (amountMXN: number): string => {
        const selected = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0]
        const converted = amountMXN / selected.rateAgainstMXN

        return new Intl.NumberFormat(language === 'es' ? 'es-MX' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2
        }).format(converted)
    }

    const t = (key: string): string => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.es[key] || key
    }

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
