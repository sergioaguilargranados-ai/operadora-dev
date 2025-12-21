import { query, queryOne, queryMany, insertOne } from '@/lib/db'

export interface Currency {
  code: string
  name: string
  symbol: string
  decimal_places: number
  is_active: boolean
  created_at: Date
}

export interface ExchangeRate {
  id: number
  base_currency: string
  target_currency: string
  rate: number
  date: Date
  source: string
  created_at: Date
}

class CurrencyService {
  private baseCurrency = 'MXN'
  private cacheExpiration = 24 * 60 * 60 * 1000 // 24 horas en millisegundos

  /**
   * Obtener todas las monedas activas
   */
  async getAllCurrencies(): Promise<Currency[]> {
    return queryMany<Currency>(
      'SELECT * FROM currencies WHERE is_active = true ORDER BY code'
    )
  }

  /**
   * Obtener información de una moneda
   */
  async getCurrency(code: string): Promise<Currency | null> {
    return queryOne<Currency>(
      'SELECT * FROM currencies WHERE code = $1',
      [code.toUpperCase()]
    )
  }

  /**
   * Obtener tipo de cambio más reciente
   */
  async getLatestExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRate | null> {
    // Si son la misma moneda, retornar 1.0
    if (fromCurrency === toCurrency) {
      return {
        id: 0,
        base_currency: fromCurrency,
        target_currency: toCurrency,
        rate: 1.0,
        date: new Date(),
        source: 'same_currency',
        created_at: new Date()
      }
    }

    return queryOne<ExchangeRate>(
      `SELECT * FROM exchange_rates
       WHERE base_currency = $1 AND target_currency = $2
       ORDER BY date DESC, created_at DESC
       LIMIT 1`,
      [fromCurrency.toUpperCase(), toCurrency.toUpperCase()]
    )
  }

  /**
   * Convertir monto de una moneda a otra
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ amount: number; rate: number; date: Date }> {
    // Si son la misma moneda, no hacer conversión
    if (fromCurrency === toCurrency) {
      return {
        amount,
        rate: 1.0,
        date: new Date()
      }
    }

    // Obtener tipo de cambio
    const rate = await this.getLatestExchangeRate(fromCurrency, toCurrency)

    if (!rate) {
      // Si no hay tipo directo, intentar conversión inversa
      const inverseRate = await this.getLatestExchangeRate(toCurrency, fromCurrency)

      if (!inverseRate) {
        // Si tampoco hay inversa, intentar a través de moneda base (MXN)
        return this.convertThroughBase(amount, fromCurrency, toCurrency)
      }

      // Usar tasa inversa
      const convertedAmount = amount / inverseRate.rate

      return {
        amount: await this.roundToDecimals(convertedAmount, toCurrency),
        rate: 1 / inverseRate.rate,
        date: inverseRate.date
      }
    }

    const convertedAmount = amount * rate.rate

    return {
      amount: await this.roundToDecimals(convertedAmount, toCurrency),
      rate: rate.rate,
      date: rate.date
    }
  }

  /**
   * Convertir a través de moneda base (cuando no hay conversión directa)
   */
  private async convertThroughBase(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ amount: number; rate: number; date: Date }> {
    // Convertir de fromCurrency a MXN
    const toBase = await this.convert(amount, fromCurrency, this.baseCurrency)

    // Convertir de MXN a toCurrency
    const toTarget = await this.convert(toBase.amount, this.baseCurrency, toCurrency)

    return {
      amount: toTarget.amount,
      rate: toBase.rate * toTarget.rate,
      date: toTarget.date
    }
  }

  /**
   * Redondear a decimales según moneda
   */
  private async roundToDecimals(amount: number, currencyCode: string): Promise<number> {
    const currency = await this.getCurrency(currencyCode)
    const decimals = currency?.decimal_places ?? 2

    return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }

  /**
   * Guardar nuevo tipo de cambio
   */
  async saveExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    source: string = 'manual'
  ): Promise<ExchangeRate> {
    return insertOne<ExchangeRate>('exchange_rates', {
      base_currency: fromCurrency.toUpperCase(),
      target_currency: toCurrency.toUpperCase(),
      rate,
      date: new Date().toISOString().split('T')[0], // Solo fecha
      source
    })
  }

  /**
   * Actualizar tipos de cambio desde API externa
   */
  async updateExchangeRates(source: string = 'exchangerate-api.com'): Promise<number> {
    try {
      // Obtener tipos de cambio de API externa
      const rates = await this.fetchExchangeRatesFromAPI(source)

      if (!rates) {
        throw new Error('No se pudieron obtener tipos de cambio')
      }

      let updated = 0

      // Guardar cada tipo de cambio
      for (const [currency, rate] of Object.entries(rates)) {
        if (currency !== this.baseCurrency) {
          try {
            await this.saveExchangeRate(this.baseCurrency, currency, rate as number, source)
            updated++
          } catch (error) {
            console.error(`Error guardando tipo de cambio para ${currency}:`, error)
          }
        }
      }

      return updated
    } catch (error) {
      console.error('Error actualizando tipos de cambio:', error)
      throw error
    }
  }

  /**
   * Obtener tipos de cambio desde API externa
   */
  private async fetchExchangeRatesFromAPI(source: string): Promise<Record<string, number> | null> {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY

    try {
      // ExchangeRate-API.com (gratis 1,500 requests/mes)
      if (source === 'exchangerate-api.com') {
        const url = apiKey
          ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${this.baseCurrency}`
          : `https://open.er-api.com/v6/latest/${this.baseCurrency}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.result === 'success') {
          return data.conversion_rates
        }
      }

      // Fixer.io (alternativa)
      if (source === 'fixer.io' && apiKey) {
        const url = `http://data.fixer.io/api/latest?access_key=${apiKey}&base=${this.baseCurrency}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          return data.rates
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      return null
    }
  }

  /**
   * Verificar si los tipos de cambio están actualizados
   */
  async needsUpdate(): Promise<boolean> {
    const latest = await queryOne<{ date: Date }>(
      `SELECT MAX(date) as date FROM exchange_rates WHERE base_currency = $1`,
      [this.baseCurrency]
    )

    if (!latest?.date) {
      return true
    }

    const lastUpdate = new Date(latest.date)
    const now = new Date()
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    // Actualizar si han pasado más de 24 horas
    return hoursSinceUpdate > 24
  }

  /**
   * Formatear monto con símbolo de moneda
   */
  async formatAmount(amount: number, currencyCode: string): Promise<string> {
    const currency = await this.getCurrency(currencyCode)

    if (!currency) {
      return amount.toFixed(2)
    }

    const formattedAmount = amount.toFixed(currency.decimal_places)

    // Formato con separadores de miles
    const parts = formattedAmount.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return `${currency.symbol}${parts.join('.')}`
  }

  /**
   * Obtener tipos de cambio para múltiples monedas
   */
  async getExchangeRatesForCurrencies(
    baseCurrency: string,
    targetCurrencies: string[]
  ): Promise<Record<string, number>> {
    const rates: Record<string, number> = {}

    for (const target of targetCurrencies) {
      const rate = await this.getLatestExchangeRate(baseCurrency, target)
      if (rate) {
        rates[target] = rate.rate
      }
    }

    return rates
  }

  /**
   * Obtener historial de tipos de cambio
   */
  async getExchangeRateHistory(
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Promise<ExchangeRate[]> {
    return queryMany<ExchangeRate>(
      `SELECT * FROM exchange_rates
       WHERE base_currency = $1
       AND target_currency = $2
       AND date >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY date DESC`,
      [fromCurrency.toUpperCase(), toCurrency.toUpperCase()]
    )
  }

  /**
   * Convertir múltiples montos a una moneda objetivo
   */
  async convertMultiple(
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrency: string
  ): Promise<{ total: number; conversions: Array<{ original: number; converted: number; currency: string }> }> {
    const conversions = await Promise.all(
      amounts.map(async ({ amount, currency }) => {
        const result = await this.convert(amount, currency, targetCurrency)
        return {
          original: amount,
          converted: result.amount,
          currency
        }
      })
    )

    const total = conversions.reduce((sum, c) => sum + c.converted, 0)

    return {
      total: await this.roundToDecimals(total, targetCurrency),
      conversions
    }
  }
}

export default new CurrencyService()
